/**
 * @file sitemap.ts
 * DB 기반 동적 사이트맵 생성 API.
 * 정적 페이지 + blog_posts 테이블의 published 포스트를 포함한다.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";

const BASE_URL = "https://runmania.kr";
const SITE_LASTMOD = "2026-05-05";

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/tools/diagnosis", changefreq: "monthly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/reviews", changefreq: "weekly", priority: "0.8" },
  { path: "/tools", changefreq: "monthly", priority: "0.7" },
  { path: "/tools/calorie-calculator", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/heart-rate-zones", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/race-predictor", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/training-paces", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/weight-loss", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/pace-calculator", changefreq: "monthly", priority: "0.5" },
  { path: "/tools/size-converter", changefreq: "monthly", priority: "0.5" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const result = await tursoClient.execute(
      `SELECT slug, published_at, updated_at
       FROM blog_posts
       WHERE status = 'published' AND workflow_status = 'approved'
       ORDER BY published_at DESC`,
    );

    const staticEntries = STATIC_PAGES.map(
      (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${SITE_LASTMOD}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    );

    const blogEntries = result.rows.map((row) => {
      const lastmod = String(row.updated_at ?? row.published_at ?? "").slice(
        0,
        10,
      );
      return `  <url>
    <loc>${BASE_URL}/blog/${row.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...blogEntries].join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(xml);
  } catch (error) {
    console.error("[sitemap] Error:", error);
    return res.status(500).send("Failed to generate sitemap");
  }
}
