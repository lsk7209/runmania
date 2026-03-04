import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === "GET") {
        try {
            const result = await tursoClient.execute(`
        SELECT * FROM blog_posts 
        WHERE status = 'published' 
        ORDER BY published_at DESC
      `);

            const posts = result.rows.map((row: any) => {
                return {
                    ...row,
                    content: typeof row.content === "string" ? JSON.parse(row.content) : row.content,
                    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
                    related_slugs: typeof row.related_slugs === "string" ? JSON.parse(row.related_slugs) : row.related_slugs,
                    faq: typeof row.faq === "string" ? JSON.parse(row.faq) : row.faq,
                };
            });

            return res.status(200).json(posts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            return res.status(500).json({ error: "Failed to fetch posts" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
