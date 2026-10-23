// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import {
  NOINDEX_POST_SLUGS,
  REDIRECTED_POSTS,
  getRedirectTarget,
  isIndexablePost,
  isNoindexPost,
} from "../../api/indexPolicy";

const mocks = vi.hoisted(() => ({ dbExecute: vi.fn() }));

vi.mock("../../api/db.js", () => ({
  tursoClient: { execute: mocks.dbExecute },
}));

const NOINDEX_SLUG = "힐드롭-선택법-선택-기준-착지-장거리-노면";
const KEPT_SLUG = "running-in-rain-shoe-guide";

function createRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data: unknown) => {
      res.body = data;
      return res;
    }),
    send: vi.fn((data: unknown) => {
      res.body = data;
      return res;
    }),
    setHeader: vi.fn(),
  };
  return res;
}

function get(query: Record<string, string> = {}) {
  return { method: "GET", query } as unknown as VercelRequest;
}

const rows = [
  { slug: NOINDEX_SLUG, title: "템플릿 글", published_at: "2026-06-01" },
  { slug: KEPT_SLUG, title: "유지 글", published_at: "2026-06-02" },
];

describe("noindex 대상 글", () => {
  beforeEach(() => {
    mocks.dbExecute.mockReset();
    mocks.dbExecute.mockResolvedValue({ rows });
  });

  it("감사에서 판정한 템플릿 글 200편을 담는다", () => {
    expect(NOINDEX_POST_SLUGS.size).toBe(200);
    expect(isNoindexPost(NOINDEX_SLUG)).toBe(true);
    expect(isNoindexPost(KEPT_SLUG)).toBe(false);
    expect(isNoindexPost(undefined)).toBe(false);
  });

  it("사이트맵에서 제외한다", async () => {
    const { default: handler } = await import("../../api/sitemap");
    const res = createRes();
    await handler(get(), res as unknown as VercelResponse);
    expect(res.body).toContain(`/blog/${KEPT_SLUG}`);
    expect(res.body).not.toContain(NOINDEX_SLUG);
  });

  it("RSS에서 제외한다", async () => {
    const { default: handler } = await import("../../api/rss");
    const res = createRes();
    await handler(get(), res as unknown as VercelResponse);
    expect(res.body).toContain(KEPT_SLUG);
    expect(res.body).not.toContain(NOINDEX_SLUG);
  });

  it("글 목록에서 숨기고, 단건 조회에는 noindex 플래그를 붙인다", async () => {
    const { default: handler } = await import("../../api/posts");

    const listRes = createRes();
    await handler(get(), listRes as unknown as VercelResponse);
    expect((listRes.body as { slug: string }[]).map((p) => p.slug)).toEqual([
      KEPT_SLUG,
    ]);

    mocks.dbExecute.mockResolvedValueOnce({ rows: [rows[0]] });
    const detailRes = createRes();
    await handler(
      get({ slug: NOINDEX_SLUG }),
      detailRes as unknown as VercelResponse,
    );
    expect(detailRes.body).toMatchObject({ slug: NOINDEX_SLUG, noindex: true });
  });
});

describe("중복 글 301 통합", () => {
  it("vercel.json redirects가 REDIRECTED_POSTS와 정확히 일치한다", () => {
    const config = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "vercel.json"), "utf8"),
    ) as {
      redirects: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }>;
    };
    const blogRedirects = config.redirects.filter((r) =>
      r.source.startsWith("/blog/"),
    );

    expect(
      Object.fromEntries(
        blogRedirects.map((r) => [r.source.slice(6), r.destination.slice(6)]),
      ),
    ).toEqual(REDIRECTED_POSTS);
    expect(blogRedirects.every((r) => r.permanent)).toBe(true);
  });

  it("대표글은 색인 대상이다 (리다이렉트 체인·noindex 금지)", () => {
    for (const target of Object.values(REDIRECTED_POSTS)) {
      expect(isIndexablePost(target)).toBe(true);
    }
  });

  it("통합된 글은 사이트맵·목록에서 빠지고 단건 조회에 redirect_to를 준다", async () => {
    const from = "break-in-running-shoes";
    mocks.dbExecute.mockReset();
    mocks.dbExecute.mockResolvedValue({
      rows: [
        { slug: from, title: "옛 글", published_at: "2026-05-01" },
        ...rows,
      ],
    });

    const { default: sitemap } = await import("../../api/sitemap");
    const sitemapRes = createRes();
    await sitemap(get(), sitemapRes as unknown as VercelResponse);
    expect(sitemapRes.body).not.toContain(from);

    const { default: posts } = await import("../../api/posts");
    const listRes = createRes();
    await posts(get(), listRes as unknown as VercelResponse);
    expect(
      (listRes.body as { slug: string }[]).map((p) => p.slug),
    ).not.toContain(from);

    const detailRes = createRes();
    await posts(get({ slug: from }), detailRes as unknown as VercelResponse);
    expect(detailRes.body).toMatchObject({
      redirect_to: getRedirectTarget(from),
    });
  });
});
