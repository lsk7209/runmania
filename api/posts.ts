import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";

type PostRow = Record<string, unknown>;

type FaqItem = {
  question: string;
  answer: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const slug = typeof req.query.slug === "string" ? req.query.slug : undefined;

    if (slug) {
      const result = await tursoClient.execute({
        sql: `
          SELECT *
          FROM blog_posts
          WHERE status = 'published'
            AND workflow_status = 'approved'
            AND slug = ?
          LIMIT 1
        `,
        args: [slug],
      });

      const row = result.rows[0];
      if (!row) {
        return res.status(404).json({ error: "Post not found" });
      }

      return res.status(200).json(parsePostRow(row));
    }

    const result = await tursoClient.execute(`
      SELECT slug, title, excerpt, tags, read_time, hero_image, related_slugs, published_at, updated_at
      FROM blog_posts
      WHERE status = 'published'
        AND workflow_status = 'approved'
      ORDER BY published_at DESC
    `);

    return res.status(200).json(result.rows.map(parsePostRow));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
}

function parsePostRow(row: PostRow) {
  return {
    ...row,
    content: parseStringArray(row.content),
    tags: parseStringArray(row.tags),
    related_slugs: parseStringArray(row.related_slugs),
    faq: parseFaqArray(row.faq),
    generation_meta: tryParseJson(row.generation_meta),
  };
}

function parseStringArray(value: unknown) {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

function parseFaqArray(value: unknown): FaqItem[] {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const question = String((item as FaqItem).question ?? "").trim();
      const answer = String((item as FaqItem).answer ?? "").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is FaqItem => item !== null);
}

function tryParseJson(value: unknown) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}
