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

// [텍스트](url) → 텍스트
function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

// "안녕하세요! ... 전문가로서," 형태의 AI 서론 제거
function fixAiOpener(text: string): string {
  return text.replace(
    /^안녕하세요[^.!]*?(?:전문가로서|블로거로서|러너로서)[^.!]*[.!]\s*/,
    "",
  );
}

function processText(text: string): string {
  return fixAiOpener(stripMarkdownLinks(text));
}

function processJsonArray(raw: string): string {
  try {
    const arr: string[] = JSON.parse(raw);
    const fixed = arr.map(processText);
    return JSON.stringify(fixed);
  } catch {
    return JSON.stringify([processText(raw)]);
  }
}

function processJsonFaq(raw: string): string {
  try {
    const arr: { q: string; a: string }[] = JSON.parse(raw);
    const fixed = arr.map((item) => ({
      q: processText(item.q),
      a: processText(item.a),
    }));
    return JSON.stringify(fixed);
  } catch {
    return raw;
  }
}

async function main() {
  // 1. "바람이 부는 이유" 삭제
  const delResult = await db.execute(
    "DELETE FROM blog_posts WHERE slug='바람이-부는-이유'",
  );
  console.log(`삭제: 바람이-부는-이유 (${delResult.rowsAffected}행)`);

  // 2. 나머지 idea 포스트 콘텐츠 정제
  const r = await db.execute(
    "SELECT id, slug, excerpt, content, faq FROM blog_posts WHERE workflow_status='idea'",
  );

  let fixed = 0;
  let skipped = 0;

  for (const row of r.rows) {
    const id = row.id;
    const origExcerpt = String(row.excerpt ?? "");
    const origContent = String(row.content ?? "");
    const origFaq = String(row.faq ?? "");

    const newExcerpt = processText(origExcerpt);
    const newContent = processJsonArray(origContent);
    const newFaq =
      origFaq && origFaq !== "null" ? processJsonFaq(origFaq) : origFaq;

    const changed =
      newExcerpt !== origExcerpt ||
      newContent !== origContent ||
      newFaq !== origFaq;

    if (!changed) {
      skipped++;
      continue;
    }

    await db.execute(
      "UPDATE blog_posts SET excerpt=?, content=?, faq=? WHERE id=?",
      [newExcerpt, newContent, newFaq, id],
    );
    console.log(`수정: ${row.slug}`);
    fixed++;
  }

  console.log(`\n완료: 수정 ${fixed}개, 변경없음 ${skipped}개`);
}

main().catch(console.error);
