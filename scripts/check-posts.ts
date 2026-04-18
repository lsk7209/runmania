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

const r = await db.execute(
  "SELECT title, status, workflow_status, scheduled_at, LENGTH(content) as content_len FROM blog_posts WHERE content_type='blog' ORDER BY scheduled_at ASC",
);
console.log(`총 ${r.rows.length}개 블로그 포스트\n`);
r.rows.forEach((row, i) => {
  const date = String(row.scheduled_at ?? "").slice(0, 10);
  const hasContent = Number(row.content_len) > 10;
  console.log(
    `${String(i + 1).padStart(2)}. [${row.status}/${row.workflow_status}] ${date} | 콘텐츠:${hasContent ? "✅" : "❌"} | ${String(row.title).slice(0, 35)}`,
  );
});
