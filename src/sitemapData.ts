/**
 * Centralized sitemap entries.
 * Blog posts are auto-appended from Blog.tsx posts array via the vite plugin.
 * Add new pages here — they'll appear in the generated sitemap automatically.
 */

export interface SitemapEntry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  lastmod?: string;
}

export const staticPages: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/tools/diagnosis", changefreq: "monthly", priority: 0.9 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/reviews", changefreq: "weekly", priority: 0.6 },
  { path: "/tools", changefreq: "monthly", priority: 0.6 },
  { path: "/tools/pace-calculator", changefreq: "monthly", priority: 0.5 },
  { path: "/tools/size-converter", changefreq: "monthly", priority: 0.5 },
];
