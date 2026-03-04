import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
        return res.status(400).json({ error: "Slug is required" });
    }

    if (req.method === "GET") {
        try {
            const result = await tursoClient.execute({
                sql: "SELECT view_count FROM blog_views WHERE slug = ?",
                args: [slug],
            });

            const count = result.rows[0]?.view_count ?? 0;
            return res.status(200).json({ count });
        } catch (e: any) {
            console.error(e);
            return res.status(500).json({ error: e.message || "Internal Server Error" });
        }
    } else if (req.method === "POST") {
        try {
            await tursoClient.execute({
                sql: `
          INSERT INTO blog_views (slug, view_count, created_at, updated_at)
          VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT(slug) DO UPDATE SET 
            view_count = view_count + 1,
            updated_at = CURRENT_TIMESTAMP
        `,
                args: [slug],
            });

            const result = await tursoClient.execute({
                sql: "SELECT view_count FROM blog_views WHERE slug = ?",
                args: [slug],
            });
            const count = result.rows[0]?.view_count ?? 1;

            return res.status(200).json({ count });
        } catch (e: any) {
            console.error(e);
            return res.status(500).json({ error: e.message || "Internal Server Error" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
