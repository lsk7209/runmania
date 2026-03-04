import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { password, action, data } = req.body || {};

    // Auth check
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD.trim()) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        switch (action) {
            // ── List posts ──────────────────────────────────────────────
            case "list": {
                const status = data?.status || "all";
                const sql =
                    status === "all"
                        ? "SELECT * FROM blog_posts ORDER BY created_at DESC"
                        : "SELECT * FROM blog_posts WHERE status = ? ORDER BY created_at DESC";
                const result = status === "all"
                    ? await tursoClient.execute(sql)
                    : await tursoClient.execute({ sql, args: [status] });

                const posts = result.rows.map((row: any) => ({
                    ...row,
                    content: tryParse(row.content),
                    tags: tryParse(row.tags),
                    related_slugs: tryParse(row.related_slugs),
                    faq: tryParse(row.faq),
                }));
                return res.status(200).json(posts);
            }

            // ── Create post ─────────────────────────────────────────────
            case "create": {
                const id = crypto.randomUUID();
                await tursoClient.execute({
                    sql: `INSERT INTO blog_posts
                  (id, title, slug, excerpt, content, tags, read_time, hero_image,
                   related_slugs, faq, status, created_at, updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?, 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    args: [
                        id,
                        data.title,
                        data.slug,
                        data.excerpt ?? null,
                        JSON.stringify(data.content ?? []),
                        JSON.stringify(data.tags ?? []),
                        data.read_time ?? null,
                        data.hero_image ?? null,
                        JSON.stringify(data.related_slugs ?? []),
                        JSON.stringify(data.faq ?? []),
                    ],
                });
                return res.status(200).json({ id, slug: data.slug });
            }

            // ── Update post ─────────────────────────────────────────────
            case "update": {
                await tursoClient.execute({
                    sql: `UPDATE blog_posts SET
                  title=?, slug=?, excerpt=?, content=?, tags=?, read_time=?, hero_image=?,
                  related_slugs=?, faq=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?`,
                    args: [
                        data.title,
                        data.slug,
                        data.excerpt ?? null,
                        JSON.stringify(data.content ?? []),
                        JSON.stringify(data.tags ?? []),
                        data.read_time ?? null,
                        data.hero_image ?? null,
                        JSON.stringify(data.related_slugs ?? []),
                        JSON.stringify(data.faq ?? []),
                        data.id,
                    ],
                });
                return res.status(200).json({ success: true });
            }

            // ── Delete post ─────────────────────────────────────────────
            case "delete": {
                await tursoClient.execute({
                    sql: "DELETE FROM blog_posts WHERE id = ?",
                    args: [data.id],
                });
                return res.status(200).json({ success: true });
            }

            // ── Publish ─────────────────────────────────────────────────
            case "publish": {
                await tursoClient.execute({
                    sql: `UPDATE blog_posts SET status='published', published_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
                    args: [data.id],
                });
                return res.status(200).json({ success: true });
            }

            // ── Unpublish ────────────────────────────────────────────────
            case "unpublish": {
                await tursoClient.execute({
                    sql: `UPDATE blog_posts SET status='draft', published_at=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
                    args: [data.id],
                });
                return res.status(200).json({ success: true });
            }

            // ── Bulk create drafts ───────────────────────────────────────
            case "bulk_create": {
                const titles: string[] = data.titles ?? [];
                for (const title of titles) {
                    const id = crypto.randomUUID();
                    const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9가-힣\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .substring(0, 100);
                    await tursoClient.execute({
                        sql: `INSERT INTO blog_posts (id, title, slug, content, tags, related_slugs, faq, status, created_at, updated_at)
                  VALUES (?,?,?, '[]', '[]', '[]', '[]', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        args: [id, title, slug],
                    });
                }
                return res.status(200).json({ created: titles.length });
            }

            // ── Seed hardcoded posts ─────────────────────────────────────
            case "seed": {
                const posts: any[] = data.posts ?? [];
                let upserted = 0;
                for (const post of posts) {
                    const id = crypto.randomUUID();
                    await tursoClient.execute({
                        sql: `INSERT INTO blog_posts
                    (id, title, slug, excerpt, content, tags, read_time, hero_image,
                     related_slugs, faq, status, published_at, created_at, updated_at)
                  VALUES (?,?,?,?,?,?,?,?,?,?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                  ON CONFLICT(slug) DO UPDATE SET
                    title=excluded.title, excerpt=excluded.excerpt, content=excluded.content,
                    tags=excluded.tags, read_time=excluded.read_time, hero_image=excluded.hero_image,
                    related_slugs=excluded.related_slugs, faq=excluded.faq, updated_at=CURRENT_TIMESTAMP`,
                        args: [
                            id,
                            post.title,
                            post.slug,
                            post.excerpt ?? null,
                            JSON.stringify(post.content ?? []),
                            JSON.stringify(post.tags ?? []),
                            post.readTime ?? post.read_time ?? null,
                            post.heroImagePath ?? post.hero_image ?? null,
                            JSON.stringify(post.relatedSlugs ?? post.related_slugs ?? []),
                            JSON.stringify(post.faq ?? []),
                        ],
                    });
                    upserted++;
                }
                return res.status(200).json({ upserted });
            }

            // ── Settings get/update ──────────────────────────────────────
            case "get_settings": {
                const result = await tursoClient.execute("SELECT * FROM app_settings WHERE id = 1");
                const row = result.rows[0] as any;
                return res.status(200).json(
                    row
                        ? {
                            publish_interval_hours: row.publish_interval_hours ?? 24,
                            auto_publish_enabled: Boolean(row.auto_publish_enabled ?? 1),
                        }
                        : { publish_interval_hours: 24, auto_publish_enabled: true }
                );
            }

            case "update_settings": {
                await tursoClient.execute({
                    sql: `INSERT INTO app_settings (id, publish_interval_hours, auto_publish_enabled, updated_at)
                VALUES (1, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  publish_interval_hours=excluded.publish_interval_hours,
                  auto_publish_enabled=excluded.auto_publish_enabled,
                  updated_at=CURRENT_TIMESTAMP`,
                    args: [
                        data.publish_interval_hours ?? 24,
                        data.auto_publish_enabled ? 1 : 0,
                    ],
                });
                return res.status(200).json({ success: true });
            }

            default:
                return res.status(400).json({ error: `Unknown action: ${action}` });
        }
    } catch (error: any) {
        console.error(`[admin-blog] action=${action}`, error);
        return res.status(500).json({ error: error.message ?? "Internal Server Error" });
    }
}

function tryParse(val: any) {
    if (typeof val === "string") {
        try { return JSON.parse(val); } catch { return val; }
    }
    return val;
}
