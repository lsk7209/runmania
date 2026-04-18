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
    "SELECT title, slug, content FROM blog_posts WHERE workflow_status='idea' ORDER BY created_at",
  );
  for (const row of r.rows) {
    let content: string[] = [];
    try {
      content = JSON.parse(String(row.content));
    } catch {
      content = [String(row.content)];
    }
    console.log("=== 제목:", row.title);
    console.log("슬러그:", row.slug);
    console.log("첫 섹션 미리보기:", String(content[0] ?? "").slice(0, 400));
    console.log();
  }
}

main().catch(console.error);
