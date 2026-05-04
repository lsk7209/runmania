/**
 * Build-time sitemap generator.
 * Reads static pages from sitemapData.ts and blog post slugs from Blog.tsx,
 * then writes public/sitemap.xml automatically.
 *
 * Run: npx tsx scripts/generate-sitemap.ts
 * Also invoked automatically via Vite plugin at build time.
 */

import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://www.runmania.kr";

interface SitemapEntry {
  path: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

// --- 1. Parse static pages from sitemapData.ts ---
function parseStaticPages(): SitemapEntry[] {
  const filePath = path.resolve(__dirname, "../src/sitemapData.ts");
  const content = fs.readFileSync(filePath, "utf-8");

  const entries: SitemapEntry[] = [];
  // Match each object in the staticPages array
  const regex = /\{\s*path:\s*"([^"]+)",\s*changefreq:\s*"([^"]+)",\s*priority:\s*([\d.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    entries.push({
      path: match[1],
      changefreq: match[2],
      priority: parseFloat(match[3]),
    });
  }
  return entries;
}

// --- 2. Parse blog posts from Blog.tsx ---
function parseBlogPosts(): SitemapEntry[] {
  const filePath = path.resolve(__dirname, "../src/pages/Blog.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  const entries: SitemapEntry[] = [];
  // Match slug and dateModified pairs
  const slugRegex = /slug:\s*"([^"]+)"/g;
  const dateModRegex = /dateModified:\s*"([^"]+)"/g;

  const slugs: string[] = [];
  const dates: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = slugRegex.exec(content)) !== null) slugs.push(m[1]);
  while ((m = dateModRegex.exec(content)) !== null) dates.push(m[1]);

  for (let i = 0; i < slugs.length; i++) {
    entries.push({
      path: `/blog/${slugs[i]}`,
      changefreq: "monthly",
      priority: 0.7,
      lastmod: dates[i] || undefined,
    });
  }
  return entries;
}

// --- 3. Generate XML ---
function generateSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      let xml = `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n`;
      if (e.lastmod) xml += `    <lastmod>${e.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${e.changefreq}</changefreq>\n`;
      xml += `    <priority>${e.priority.toFixed(1)}</priority>\n`;
      xml += `  </url>`;
      return xml;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

// --- Main ---
const staticPages = parseStaticPages();
const blogPosts = parseBlogPosts();
const all = [...staticPages, ...blogPosts];

const xml = generateSitemap(all);
const outPath = path.resolve(__dirname, "../public/sitemap.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`✅ sitemap.xml generated with ${all.length} URLs`);
