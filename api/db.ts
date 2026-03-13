import { createClient } from "@libsql/client/web";

type DbClient = ReturnType<typeof createClient>;
type ExecuteArgs = Parameters<DbClient["execute"]>;
type BatchArgs = Parameters<DbClient["batch"]>;

// @libsql/client/web requires https:// not libsql://
function fixUrl(url: string): string {
  if (url.startsWith("libsql://")) {
    return url.replace("libsql://", "https://");
  }
  return url;
}

export function getDb() {
  const rawUrl = (process.env.TURSO_DATABASE_URL || "").trim();
  const authToken = (process.env.TURSO_AUTH_TOKEN || "").trim();
  if (!rawUrl) {
    throw new Error("TURSO_DATABASE_URL is not set in Vercel environment variables.");
  }
  return createClient({ url: fixUrl(rawUrl), authToken });
}

export const tursoClient = {
  execute: (...args: ExecuteArgs) => getDb().execute(...args),
  batch: (...args: BatchArgs) => getDb().batch(...args),
};

let schemaEnsured = false;

async function addColumnIfMissing(sql: string) {
  try {
    await tursoClient.execute(sql);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    if (!message.includes("duplicate column name")) {
      throw error;
    }
  }
}

export async function ensureContentSchema() {
  if (schemaEnsured) return;

  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      publish_interval_hours INTEGER NOT NULL DEFAULT 24,
      auto_publish_enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await tursoClient.execute("INSERT OR IGNORE INTO app_settings (id) VALUES (1)");

  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS content_generation_logs (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      content_type TEXT,
      workflow_status TEXT,
      requested_prompt TEXT NOT NULL DEFAULT '{}',
      generated_title TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    )
  `);

  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN scheduled_at TEXT");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN content_type TEXT NOT NULL DEFAULT 'blog'");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN workflow_status TEXT NOT NULL DEFAULT 'idea'");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN generation_meta TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN last_generated_at TEXT");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN generation_count INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN generation_in_progress INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing("ALTER TABLE blog_posts ADD COLUMN generation_started_at TEXT");

  schemaEnsured = true;
}
