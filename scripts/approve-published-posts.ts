import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const db = createClient({
  url: (process.env.TURSO_DATABASE_URL ?? "").replace("libsql://", "https://"),
  authToken: process.env.TURSO_AUTH_TOKEN ?? "",
});

async function main() {
  const r = await db.execute(
    "UPDATE blog_posts SET workflow_status='approved' WHERE status='published' AND workflow_status='idea'",
  );
  console.log(`업데이트: ${r.rowsAffected}개 포스트 idea→approved`);

  const check = await db.execute(
    "SELECT COUNT(*) as cnt FROM blog_posts WHERE status='published' AND workflow_status='approved'",
  );
  console.log(`published+approved 총: ${check.rows[0].cnt}개`);
}

main().catch(console.error);
