import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        console.log(`[Cron] Executed at: ${new Date().toISOString()}`);

        const resultSettings = await tursoClient.execute("SELECT * FROM app_settings WHERE id = 1");
        const settings = resultSettings.rows[0] as any;

        const autoPublishEnabled = settings ? Boolean(settings.auto_publish_enabled ?? 1) : true;
        const publishIntervalHours = settings ? (settings.publish_interval_hours ?? 24) : 24;

        if (!autoPublishEnabled) {
            console.log("[Cron] Auto-publish is disabled in settings. Exiting.");
            return res.status(200).json({ success: true, message: "Auto-publish disabled" });
        }

        // Find the last published post
        const resultLastPost = await tursoClient.execute(
            "SELECT published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 1"
        );
        const lastPost = resultLastPost.rows[0] as any;

        let shouldPublish = false;

        if (!lastPost || !lastPost.published_at) {
            shouldPublish = true;
        } else {
            const lastPublishedAt = new Date(lastPost.published_at);
            const now = new Date();
            const hoursDiff = (now.getTime() - lastPublishedAt.getTime()) / (1000 * 60 * 60);

            if (hoursDiff >= publishIntervalHours) {
                shouldPublish = true;
            } else {
                console.log(`[Cron] Next publish in ${(publishIntervalHours - hoursDiff).toFixed(1)} hours.`);
                return res.status(200).json({
                    success: true,
                    message: `Waiting for interval. Next publish in ${(publishIntervalHours - hoursDiff).toFixed(1)} hours.`
                });
            }
        }

        if (shouldPublish) {
            // Find the oldest draft or scheduled post
            const resultDraft = await tursoClient.execute(
                "SELECT id, title, slug FROM blog_posts WHERE status IN ('draft', 'scheduled') ORDER BY created_at ASC LIMIT 1"
            );

            if (resultDraft.rows.length > 0) {
                const draft = resultDraft.rows[0] as any;

                await tursoClient.execute({
                    sql: `UPDATE blog_posts SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    args: [draft.id]
                });

                console.log(`[Cron] Auto-published post: ${draft.title} (${draft.slug})`);

                return res.status(200).json({
                    success: true,
                    message: "Successfully auto-published a post",
                    publishedPost: draft.slug
                });
            } else {
                console.log("[Cron] No draft or scheduled posts available to publish.");
                return res.status(200).json({ success: true, message: "No posts available to publish" });
            }
        }
    } catch (err: any) {
        console.error("[Cron] Error executing job:", err);
        return res.status(500).json({ error: err.message || "Error executing cron job" });
    }
}
