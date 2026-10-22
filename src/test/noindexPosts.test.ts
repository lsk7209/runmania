// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { NOINDEX_POST_SLUGS, isNoindexPost } from "../../api/noindexPosts";

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
