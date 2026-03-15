/**
 * @file db.ts
 * Turso(LibSQL) 데이터베이스 클라이언트 설정 및 스키마 마이그레이션.
 * 매 요청마다 새 클라이언트를 생성하는 방식(서버리스 환경 대응)이며,
 * ensureContentSchema()로 필요한 테이블/컬럼을 자동 생성한다.
 */
import { createClient } from "@libsql/client/web";

type DbClient = ReturnType<typeof createClient>;
type ExecuteArgs = Parameters<DbClient["execute"]>;
type BatchArgs = Parameters<DbClient["batch"]>;

// @libsql/client/web는 libsql:// 프로토콜을 지원하지 않으므로 https://로 변환
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

/**
 * 프록시 클라이언트 — 매 호출마다 getDb()로 새 커넥션을 생성한다.
 * Vercel 서버리스 환경에서 커넥션 풀 없이 안전하게 동작하기 위한 패턴.
 */
export const tursoClient = {
  execute: (...args: ExecuteArgs) => getDb().execute(...args),
  batch: (...args: BatchArgs) => getDb().batch(...args),
};

/** 프로세스 수명 동안 스키마 마이그레이션을 1회만 실행하기 위한 플래그 */
let schemaEnsured = false;

/** ALTER TABLE 실행 시 이미 컬럼이 존재하면 에러를 무시한다 (멱등 마이그레이션) */
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

/**
 * 콘텐츠 관련 DB 스키마를 보장한다.
 * - app_settings: 자동 발행 설정 (싱글톤 행)
 * - content_generation_logs: AI 생성 이력 추적
 * - blog_posts 추가 컬럼: 워크플로우, 예약 발행, 생성 잠금 등
 * 서버리스 환경에서 최초 1회만 실행되며, 이후 호출은 스킵된다.
 */
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
