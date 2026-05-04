/**
 * @file cron.ts
 * 자동 발행 크론잡 API 엔드포인트 (GitHub Actions에서 매 1시간 호출).
 * 실행 순서:
 *   0) idea 상태 드래프트 1건 AI 생성 → 품질 게이트 통과 시 approved 전환
 *   1) scheduled_at 도래한 approved 포스트 발행
 *   2) 발행 간격(publish_interval_hours) 확인
 *   3) approved 드래프트 중 가장 오래된 것 발행 (FIFO)
 * CRON_SECRET Bearer 토큰으로 인증하며, app_settings 테이블의 설정을 따른다.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateContentForPost } from "./admin-generate.js";
import { ensureContentSchema, tursoClient } from "./db.js";

const BASE_URL = "https://www.runmania.kr";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "b1c3e5a7d9f2e4b6a8c0d2e4f6a8b0c1";
const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://searchadvisor.naver.com/indexnow",
];

type AppSettingsRow = {
  auto_publish_enabled?: boolean | number | string | null;
  publish_interval_hours?: number | string | null;
};

type PublishCandidateRow = {
  id: string;
  title: string;
  slug: string;
  published_at?: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = (process.env.CRON_SECRET || "").trim();
  if (!cronSecret) {
    return res.status(500).json({ error: "CRON_SECRET is not configured" });
  }

  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await ensureContentSchema();
    console.log(`[Cron] Executed at: ${new Date().toISOString()}`);

    // app_settings는 싱글톤 행(id=1)으로 관리되며, 자동 발행 on/off와 발행 간격을 저장
    const resultSettings = await tursoClient.execute("SELECT * FROM app_settings WHERE id = 1");
    const settings = (resultSettings.rows[0] ?? {}) as AppSettingsRow;
    const autoPublishEnabled = isEnabled(settings.auto_publish_enabled);
    const publishIntervalHours = getPublishIntervalHours(settings.publish_interval_hours);

    // 1단계: 예약 발행 — scheduled_at 시간이 지난 승인 포스트를 최우선 발행
    const nowIso = new Date().toISOString();
    const scheduledResult = await tursoClient.execute({
      sql: `SELECT id, title, slug
            FROM blog_posts
            WHERE status = 'scheduled'
              AND workflow_status = 'approved'
              AND scheduled_at IS NOT NULL
              AND scheduled_at <= ?
            ORDER BY scheduled_at ASC, created_at ASC
            LIMIT 1`,
      args: [nowIso],
    });
    const scheduledRows = Array.isArray(scheduledResult.rows) ? scheduledResult.rows : [];

    if (scheduledRows.length > 0) {
      const scheduledPost = scheduledRows[0] as unknown as PublishCandidateRow;
      await publishPost(scheduledPost.id);
      await submitIndexNowForSlug(scheduledPost.slug);
      console.log(`[Cron] Published scheduled post: ${scheduledPost.title} (${scheduledPost.slug})`);
      return res.status(200).json({
        success: true,
        message: "Published one scheduled post",
        publishedPost: scheduledPost.slug,
      });
    }

    // 0단계: idea 상태 드래프트 1건 AI 생성
    // Admin에서 제목만 입력(bulk_create)한 포스트를 cron이 순차적으로 1건씩 생성한다.
    // Vercel 함수 타임아웃 회피를 위해 건당 1건만 처리한다.
    const ideaResult = await tursoClient.execute(
      `SELECT id, title FROM blog_posts
       WHERE status = 'draft'
         AND workflow_status = 'idea'
         AND COALESCE(generation_in_progress, 0) = 0
       ORDER BY created_at ASC
       LIMIT 1`,
    );

    if (ideaResult.rows.length > 0) {
      const ideaPost = ideaResult.rows[0] as unknown as { id: string; title: string };
      console.log(`[Cron] Generating content for: ${ideaPost.title}`);
      try {
        const generationResult = await generateContentForPost({ postId: ideaPost.id });
        if (generationResult.qualityGate.passed) {
          await tursoClient.execute({
            sql: `UPDATE blog_posts SET workflow_status='approved', updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            args: [ideaPost.id],
          });
          console.log(`[Cron] Generated and approved: ${ideaPost.title}`);
        } else {
          console.log(`[Cron] Generated (quality gate failed, stays in reviewing): ${ideaPost.title}`);
        }
      } catch (genError: unknown) {
        console.error(`[Cron] Generation failed for ${ideaPost.title}:`, genError);
      }
    }

    if (!autoPublishEnabled) {
      console.log("[Cron] Auto-publish is disabled in settings. Exiting.");
      return res.status(200).json({ success: true, message: "Auto-publish disabled" });
    }

    // 2단계: 발행 간격 확인 — 마지막 발행으로부터 설정된 시간(기본 5h)이 지났는지 확인
    const resultLastPost = await tursoClient.execute(
      "SELECT published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 1",
    );
    const lastPost = (resultLastPost.rows[0] ?? null) as unknown as PublishCandidateRow | null;

    if (lastPost?.published_at) {
      const lastPublishedAt = new Date(lastPost.published_at);
      const hoursDiff = (Date.now() - lastPublishedAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < publishIntervalHours) {
        const nextPublishIn = (publishIntervalHours - hoursDiff).toFixed(1);
        console.log(`[Cron] Next draft publish in ${nextPublishIn} hours.`);
        return res.status(200).json({
          success: true,
          message: `Waiting for interval. Next draft publish in ${nextPublishIn} hours.`,
        });
      }
    }

    // 3단계: 승인된 드래프트 중 가장 오래된 것을 자동 발행 (FIFO 순서)
    const draftResult = await tursoClient.execute(
      "SELECT id, title, slug FROM blog_posts WHERE status = 'draft' AND workflow_status = 'approved' ORDER BY created_at ASC LIMIT 1",
    );

    if (draftResult.rows.length === 0) {
      console.log("[Cron] No approved posts available to publish.");
      return res.status(200).json({ success: true, message: "No approved posts available to publish" });
    }

    const draft = draftResult.rows[0] as unknown as PublishCandidateRow;
    await publishPost(draft.id);
    await submitIndexNowForSlug(draft.slug);
    console.log(`[Cron] Auto-published approved draft: ${draft.title} (${draft.slug})`);

    return res.status(200).json({
      success: true,
      message: "Successfully auto-published an approved draft",
      publishedPost: draft.slug,
    });
  } catch (error: unknown) {
    console.error("[Cron] Error executing job:", error);
    return res.status(500).json({ error: getErrorMessage(error, "Error executing cron job") });
  }
}

async function publishPost(id: string) {
  await tursoClient.execute({
    sql: `UPDATE blog_posts
          SET status = 'published',
              published_at = CURRENT_TIMESTAMP,
              scheduled_at = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [id],
  });
}

async function submitIndexNowForSlug(slug: string) {
  if (process.env.NODE_ENV === "test") return;

  const body = JSON.stringify({
    host: "www.runmania.kr",
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: [`${BASE_URL}/blog/${slug}`],
  });

  await Promise.all(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body,
        });
        console.log(`[Cron] IndexNow submitted to ${endpoint} for ${slug}: ${response.status}`);
      } catch (error: unknown) {
        console.warn(
          `[Cron] IndexNow submission failed at ${endpoint} for ${slug}: ${getErrorMessage(error, "Unknown error")}`,
        );
      }
    }),
  );
}

/** DB에서 다양한 타입으로 저장될 수 있는 auto_publish_enabled 값을 boolean으로 변환 */
function isEnabled(value: AppSettingsRow["auto_publish_enabled"]) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value !== "0" && value.toLowerCase() !== "false";
  return true;
}

/** 발행 간격 시간을 숫자로 파싱한다. 유효하지 않으면 기본값 5시간 */
function getPublishIntervalHours(value: AppSettingsRow["publish_interval_hours"]) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 5;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
