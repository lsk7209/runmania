import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

/* ── Sitemap auto-generation plugin ── */
function sitemapPlugin(): Plugin {
  return {
    name: "vite-plugin-sitemap",
    closeBundle() {
      try {
        const BASE_URL = "https://runmania.kr";

        // Parse static pages from sitemapData.ts
        const sitemapDataPath = path.resolve(__dirname, "src/sitemapData.ts");
        const sitemapSrc = fs.readFileSync(sitemapDataPath, "utf-8");
        const staticEntries: { path: string; changefreq: string; priority: number; lastmod?: string }[] = [];
        const pageRe = /\{\s*path:\s*"([^"]+)",\s*changefreq:\s*"([^"]+)",\s*priority:\s*([\d.]+)/g;
        let m: RegExpExecArray | null;
        while ((m = pageRe.exec(sitemapSrc)) !== null) {
          staticEntries.push({ path: m[1], changefreq: m[2], priority: parseFloat(m[3]) });
        }

        // Parse blog posts from Blog.tsx
        const blogPath = path.resolve(__dirname, "src/pages/Blog.tsx");
        const blogSrc = fs.readFileSync(blogPath, "utf-8");
        const slugs: string[] = [];
        const dates: string[] = [];
        const slugRe = /slug:\s*"([^"]+)"/g;
        const dateRe = /dateModified:\s*"([^"]+)"/g;
        while ((m = slugRe.exec(blogSrc)) !== null) slugs.push(m[1]);
        while ((m = dateRe.exec(blogSrc)) !== null) dates.push(m[1]);

        const blogEntries = slugs.map((s, i) => ({
          path: `/blog/${s}`,
          changefreq: "monthly",
          priority: 0.7,
          lastmod: dates[i],
        }));

        const all = [...staticEntries, ...blogEntries];
        const urls = all
          .map((e) => {
            let xml = `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n`;
            if (e.lastmod) xml += `    <lastmod>${e.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${e.changefreq}</changefreq>\n`;
            xml += `    <priority>${e.priority.toFixed(1)}</priority>\n`;
            xml += `  </url>`;
            return xml;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        const outPath = path.resolve(__dirname, "dist/sitemap.xml");
        if (fs.existsSync(path.dirname(outPath))) {
          fs.writeFileSync(outPath, xml, "utf-8");
          console.log(`✅ sitemap.xml auto-generated with ${all.length} URLs`);
        }
      } catch (e) {
        console.warn("⚠️ Sitemap generation skipped:", e);
      }
    },
  };
}

/* ── IndexNow auto-ping plugin ── */
function indexNowPlugin(): Plugin {
  const INDEXNOW_KEY = "b1c3e5a7d9f2e4b6a8c0d2e4f6a8b0c1";
  const BASE_URL = "https://runmania.kr";

  return {
    name: "vite-plugin-indexnow",
    async closeBundle() {
      try {
        // Read generated sitemap to extract URLs
        const sitemapPath = path.resolve(__dirname, "dist/sitemap.xml");
        if (!fs.existsSync(sitemapPath)) {
          console.warn("⚠️ IndexNow skipped: sitemap.xml not found");
          return;
        }

        const sitemapXml = fs.readFileSync(sitemapPath, "utf-8");
        const locRe = /<loc>([^<]+)<\/loc>/g;
        const urlList: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = locRe.exec(sitemapXml)) !== null) {
          urlList.push(match[1]);
        }

        if (urlList.length === 0) {
          console.warn("⚠️ IndexNow skipped: no URLs found in sitemap");
          return;
        }

        // 1. IndexNow ping (Bing → auto-propagates to Naver, Yandex)
        const indexNowBody = {
          host: "runmania.kr",
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList,
        };

        const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(indexNowBody),
        });

        console.log(`✅ IndexNow ping sent: ${indexNowRes.status} (${urlList.length} URLs → Bing/Naver/Yandex)`);

        // 2. Google sitemap ping
        const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`;
        const googleRes = await fetch(googlePingUrl);
        console.log(`✅ Google sitemap ping: ${googleRes.status}`);
      } catch (e) {
        console.warn("⚠️ IndexNow ping failed (build continues):", e);
      }
    },
  };
}

/* ── RSS feed auto-generation plugin ── */
function rssPlugin(): Plugin {
  return {
    name: "vite-plugin-rss",
    closeBundle() {
      try {
        const BASE_URL = "https://runmania.kr";
        const blogPath = path.resolve(__dirname, "src/pages/Blog.tsx");
        const blogSrc = fs.readFileSync(blogPath, "utf-8");

        const slugs: string[] = [];
        const titles: string[] = [];
        const excerpts: string[] = [];
        const dates: string[] = [];

        let m: RegExpExecArray | null;
        const slugRe = /slug:\s*"([^"]+)"/g;
        const titleRe = /title:\s*"([^"]+)"/g;
        const excerptRe = /excerpt:\s*"([^"]+)"/g;
        const dateRe = /date:\s*"(\d{4}-\d{2}-\d{2})"/g;

        while ((m = slugRe.exec(blogSrc)) !== null) slugs.push(m[1]);
        while ((m = titleRe.exec(blogSrc)) !== null) titles.push(m[1]);
        while ((m = excerptRe.exec(blogSrc)) !== null) excerpts.push(m[1]);
        while ((m = dateRe.exec(blogSrc)) !== null) dates.push(m[1]);

        const items = slugs
          .map((slug, i) => {
            const pubDate = dates[i] ? new Date(dates[i]).toUTCString() : new Date().toUTCString();
            return `    <item>
      <title><![CDATA[${titles[i] || slug}]]></title>
      <link>${BASE_URL}/blog/${slug}</link>
      <description><![CDATA[${excerpts[i] || ""}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid>${BASE_URL}/blog/${slug}</guid>
    </item>`;
          })
          .join("\n");

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>런닝화매니아 블로그</title>
    <link>${BASE_URL}/blog</link>
    <description>러닝화 추천, 리뷰, 발 진단 가이드</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

        const outPath = path.resolve(__dirname, "dist/rss.xml");
        if (fs.existsSync(path.dirname(outPath))) {
          fs.writeFileSync(outPath, rss, "utf-8");
          console.log(`✅ rss.xml auto-generated with ${slugs.length} items`);
        }
      } catch (e) {
        console.warn("⚠️ RSS generation skipped:", e);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), sitemapPlugin(), indexNowPlugin(), rssPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));