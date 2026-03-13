import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureContentSchema, tursoClient } from "./db.js";

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

    const resultSettings = await tursoClient.execute("SELECT * FROM app_settings WHERE id = 1");
    const settings = (resultSettings.rows[0] ?? {}) as AppSettingsRow;
    const autoPublishEnabled = isEnabled(settings.auto_publish_enabled);
    const publishIntervalHours = getPublishIntervalHours(settings.publish_interval_hours);

    if (!autoPublishEnabled) {
      console.log("[Cron] Auto-publish is disabled in settings. Exiting.");
      return res.status(200).json({ success: true, message: "Auto-publish disabled" });
    }

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
      const scheduledPost = scheduledRows[0] as PublishCandidateRow;
      await publishPost(scheduledPost.id);
      console.log(`[Cron] Published scheduled post: ${scheduledPost.title} (${scheduledPost.slug})`);
      return res.status(200).json({
        success: true,
        message: "Published one scheduled post",
        publishedPost: scheduledPost.slug,
      });
    }

    const resultLastPost = await tursoClient.execute(
      "SELECT published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 1",
    );
    const lastPost = (resultLastPost.rows[0] ?? null) as PublishCandidateRow | null;

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

    const draftResult = await tursoClient.execute(
      "SELECT id, title, slug FROM blog_posts WHERE status = 'draft' AND workflow_status = 'approved' ORDER BY created_at ASC LIMIT 1",
    );

    if (draftResult.rows.length === 0) {
      console.log("[Cron] No approved posts available to publish.");
      return res.status(200).json({ success: true, message: "No approved posts available to publish" });
    }

    const draft = draftResult.rows[0] as PublishCandidateRow;
    await publishPost(draft.id);
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

function isEnabled(value: AppSettingsRow["auto_publish_enabled"]) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value !== "0" && value.toLowerCase() !== "false";
  return true;
}

function getPublishIntervalHours(value: AppSettingsRow["publish_interval_hours"]) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 24;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
