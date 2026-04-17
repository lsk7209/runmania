/**
 * 러닝화 블로그 10개 포스트 일괄 생성 + 스케줄 발행 설정 스크립트
 * 실행: npx tsx --env-file=.env.local scripts/bulk-schedule.ts
 *
 * 결과: 오늘(D+0)부터 매일 1개씩 총 10일간 자동 발행
 */

import { createClient } from "@libsql/client";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

// .env.local 로더 (tsx --env-file 없이 실행 시 폴백)
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

// ── 환경변수 검증 ──────────────────────────────────────────────
const TURSO_URL = process.env.TURSO_DATABASE_URL ?? "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN ?? "";

if (!TURSO_URL || TURSO_URL.includes("your-db-name")) {
  console.error("❌ TURSO_DATABASE_URL을 .env.local에 설정해주세요.");
  process.exit(1);
}
if (!TURSO_TOKEN || TURSO_TOKEN.includes("your-turso")) {
  console.error("❌ TURSO_AUTH_TOKEN을 .env.local에 설정해주세요.");
  process.exit(1);
}

// ── DB 초기화 ──────────────────────────────────────────────────
const db = createClient({
  url: TURSO_URL.startsWith("libsql://")
    ? TURSO_URL.replace("libsql://", "https://")
    : TURSO_URL,
  authToken: TURSO_TOKEN,
});

// ── 포스트 주제 목록 ───────────────────────────────────────────
const HERO_IMAGES = [
  "/assets/shoes/nike-pegasus.png",
  "/assets/shoes/asics-kayano.png",
  "/assets/shoes/hoka-bondi.png",
  "/assets/shoes/nb-1080.png",
  "/assets/shoes/nb-more.png",
];

interface PostTopic {
  title: string;
  slug: string;
  keyword: string;
  hero: string;
}

const TOPICS: PostTopic[] = [
  {
    title: "나이키 페가수스 41 완전 분석 — 2025년 최고의 올라운더 러닝화",
    slug: "nike-pegasus-41-review-2025",
    keyword: "페가수스 41 리뷰",
    hero: "/assets/shoes/nike-pegasus.png",
  },
  {
    title: "족저근막염 러너를 위한 러닝화 TOP 5 추천",
    slug: "plantar-fasciitis-running-shoes-top5",
    keyword: "족저근막염 러닝화 추천",
    hero: "/assets/shoes/asics-kayano.png",
  },
  {
    title: "발 넓이별 러닝화 선택 가이드 — 일반발·넓은발·좁은발",
    slug: "running-shoes-by-foot-width-guide",
    keyword: "발 넓이 러닝화 선택",
    hero: "/assets/shoes/nb-1080.png",
  },
  {
    title: "마라톤 서브4를 위한 카본 플레이트 러닝화 완전 비교",
    slug: "carbon-plate-running-shoes-sub4-marathon",
    keyword: "카본 플레이트 러닝화 추천",
    hero: "/assets/shoes/nike-pegasus.png",
  },
  {
    title: "10만원 이하 가성비 러닝화 BEST 5 (2025 최신판)",
    slug: "budget-running-shoes-under-100k-2025",
    keyword: "가성비 러닝화 추천 10만원",
    hero: "/assets/shoes/nb-more.png",
  },
  {
    title: "러닝화 수명과 교체 시기 — 몇 km 신어야 바꿔야 할까",
    slug: "running-shoes-lifespan-replacement-guide",
    keyword: "러닝화 수명 교체 시기",
    hero: "/assets/shoes/hoka-bondi.png",
  },
  {
    title: "초보 러너를 위한 첫 러닝화 구매 완전 가이드",
    slug: "beginner-first-running-shoes-buying-guide",
    keyword: "초보 러너 러닝화 추천",
    hero: "/assets/shoes/asics-kayano.png",
  },
  {
    title: "아치 타입별 맞춤 러닝화 선택법 — 정상·평발·요족",
    slug: "arch-type-running-shoes-guide",
    keyword: "평발 러닝화 추천 아치",
    hero: "/assets/shoes/nb-1080.png",
  },
  {
    title: "로드 러닝화 vs 트레일화 — 용도별 차이 완전 정리",
    slug: "road-vs-trail-running-shoes-difference",
    keyword: "트레일화 vs 로드화 차이",
    hero: "/assets/shoes/hoka-bondi.png",
  },
  {
    title: "여름 러닝화 추천 — 통기성과 쿠셔닝을 동시에 잡는 법",
    slug: "summer-running-shoes-breathability-cushioning",
    keyword: "여름 러닝화 추천 통기성",
    hero: "/assets/shoes/nb-more.png",
  },
];

// ── scheduled_at 계산 (KST 자정 기준) ─────────────────────────
function scheduledAt(daysFromNow: number): string {
  const d = new Date();
  // KST(UTC+9) 기준 자정 = UTC 15:00 전날
  d.setUTCHours(15, 0, 0, 0); // KST 00:00
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString();
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  console.log("🚀 runmania.kr 블로그 10개 포스트 일괄 생성 시작\n");

  let success = 0;
  let failed = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const postId = crypto.randomUUID();
    const publishDate = scheduledAt(i);

    console.log(`[${i + 1}/10] ${topic.title}`);
    console.log(`       발행 예정: ${publishDate.slice(0, 10)} KST`);

    try {
      // 1. 기존 포스트 확인 또는 신규 삽입
      const existing = await db.execute({
        sql: "SELECT id FROM blog_posts WHERE slug = ?",
        args: [topic.slug],
      });
      let targetId: string;
      if (existing.rows.length > 0) {
        targetId = String(existing.rows[0].id);
        // scheduled_at 업데이트
        await db.execute({
          sql: "UPDATE blog_posts SET scheduled_at=?, updated_at=datetime('now') WHERE id=?",
          args: [publishDate, targetId],
        });
      } else {
        targetId = postId;
        await db.execute({
          sql: `INSERT INTO blog_posts
            (id, title, slug, excerpt, content, tags, read_time, hero_image,
             related_slugs, faq, status, content_type, workflow_status,
             generation_meta, scheduled_at, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`,
          args: [
            targetId,
            topic.title,
            topic.slug,
            "",
            "[]",
            "[]",
            "7분",
            topic.hero,
            "[]",
            "[]",
            "draft",
            "blog",
            "idea",
            "{}",
            publishDate,
          ],
        });
      }

      console.log(`       ✅ 등록 완료 — slug: ${topic.slug}\n`);
      success++;
    } catch (err) {
      console.error(`       ❌ 실패: ${(err as Error).message}\n`);
      failed++;
    }
  }

  console.log("─".repeat(50));
  console.log(`완료: 성공 ${success}개 / 실패 ${failed}개`);
  console.log("\n⚠️  다음 작업 필요:");
  console.log("1. Google AI Studio에서 새 Gemini API 키 발급");
  console.log("2. Vercel 프로젝트 > Settings > Env > GEMINI_API_KEY 교체");
  console.log("3. Vercel 재배포 후 cron이 매 시간 콘텐츠 자동 생성 시작");
  console.log("4. 생성 완료 후 scheduled_at 도래 시 자동 발행 (오늘~D+9)");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
