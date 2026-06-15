/**
 * @file sitemap.ts
 * DB 기반 동적 사이트맵 생성 API.
 * 정적 페이지 + blog_posts 테이블의 published 포스트를 포함한다.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";

const BASE_URL = "https://runmania.kr";

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/tools/diagnosis", changefreq: "monthly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/reviews", changefreq: "weekly", priority: "0.8" },
  { path: "/tools", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "monthly", priority: "0.5" },
  { path: "/tools/calorie-calculator", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/heart-rate-zones", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/race-predictor", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/training-paces", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/weight-loss", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/pace-calculator", changefreq: "monthly", priority: "0.5" },
  { path: "/tools/size-converter", changefreq: "monthly", priority: "0.5" },
];

const REVIEW_SLUGS = [
  "뉴발란스-프레시폼-1080-v13-2e",
  "뉴발란스-프레시폼-모어-v4",
  "아식스-젤카야노-30",
  "브룩스-아드레날린-gts-23",
  "호카-본디-8",
  "사코니-엔돌핀-스피드-3",
  "아디다스-아디제로-보스턴-12",
  "알트라-토린-7",
  "나이키-페가수스-41",
  "나이키-베이퍼플라이-3",
  "아식스-노바블라스트-5",
  "호카-클리프톤-10",
  "브룩스-고스트-16",
  "사코니-트라이엄프-22",
  "나이키-인빈서블-3",
  "푸마-디비에이트-나이트로-3",
  "미즈노-웨이브-라이더-28",
  "온-클라우드몬스터-2",
  "뉴발란스-퓨얼셀-레벨-v4",
  "아디다스-아디제로-sl-2",
  "나이키-스트럭처-25",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await tursoClient.execute(
      `SELECT slug, published_at, updated_at
       FROM blog_posts
       WHERE status = 'published' AND workflow_status = 'approved'
       ORDER BY published_at DESC`,
    );

    const staticEntries = STATIC_PAGES.map(
      (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    );

    const reviewEntries = REVIEW_SLUGS.map(
      (slug) => `  <url>
    <loc>${BASE_URL}/reviews/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
${[...staticEntries, ...reviewEntries, ...blogEntries].join("\n")}
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
