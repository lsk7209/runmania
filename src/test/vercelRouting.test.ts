import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel routing", () => {
  it("preserves API rewrites without turning unknown URLs into the homepage", () => {
    const configPath = path.resolve(process.cwd(), "vercel.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as {
      rewrites?: Array<{ source?: string; destination?: string }>;
    };

    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/sitemap.xml", destination: "/api/sitemap" }),
        expect.objectContaining({ source: "/rss.xml", destination: "/api/rss" }),
      ]),
    );
    expect(config.rewrites).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/(.*)", destination: "/index.html" }),
      ]),
    );
  });
});
