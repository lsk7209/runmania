/**
 * @file rss.ts
 * DB 기반 동적 RSS 피드 생성 API.
 * 네이버 서치어드바이저·피드리더 연동용.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";

const BASE_URL = "https://runmania.kr";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const result = await tursoClient.execute(
      `SELECT slug, title, excerpt, published_at
       FROM blog_posts
       WHERE status = 'published' AND workflow_status = 'approved'
       ORDER BY published_at DESC
       LIMIT 50`,
    );

    const items = result.rows
      .map((row) => {
        const pubDate = row.published_at
          ? new Date(String(row.published_at)).toUTCString()
          : new Date().toUTCString();
        const title = String(row.title ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const excerpt = String(row.excerpt ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${BASE_URL}/blog/${row.slug}</link>
      <description><![CDATA[${excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/blog/${row.slug}</guid>
    </item>`;
      })
      .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>런닝화매니아 블로그</title>
    <link>${BASE_URL}/blog</link>
    <description>러닝화 추천, 리뷰, 발 진단 가이드 — 런닝화매니아</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(rss);
  } catch (error) {
    console.error("[rss] Error:", error);
    return res.status(500).send("Failed to generate RSS feed");
  }
}
