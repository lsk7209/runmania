// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const mocks = vi.hoisted(() => ({ dbExecute: vi.fn() }));

vi.mock("../../api/db.js", () => ({
  tursoClient: { execute: mocks.dbExecute },
}));

function createRes() {
  const res = {
    statusCode: 200,
    body: undefined as Record<string, unknown> | undefined,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data: Record<string, unknown>) => {
      res.body = data;
      return res;
    }),
  };
  return res;
}

const ROW = {
  slug: "running-in-rain-shoe-guide",
  title: "비 오는 날 러닝화",
  content: JSON.stringify([
    "[TIP]팁 제목",
    "[링크](/running-shoe-break-in-guide)",
  ]),
  faq: "[]",
  tags: "[]",
  related_slugs: "[]",
  generation_meta: JSON.stringify({
    metaTitle: "메타 제목",
    metaDescription: "메타 설명",
    seoKeywords: ["내부 키워드"],
    mustIncludeSections: ["내부 섹션"],
  }),
};

describe("공개 단건 글 API", () => {
  beforeEach(() => {
    mocks.dbExecute.mockReset();
    mocks.dbExecute
      .mockResolvedValueOnce({ rows: [ROW] })
      .mockResolvedValueOnce({
        rows: [{ slug: ROW.slug }, { slug: "running-shoe-break-in-guide" }],
      });
  });

  it("내부 관리 필드와 생성 프롬프트 정보를 노출하지 않는다", async () => {
    const { default: handler } = await import("../../api/posts");
    const res = createRes();
    await handler(
      { method: "GET", query: { slug: ROW.slug } } as unknown as VercelRequest,
      res as unknown as VercelResponse,
    );

    expect(String(mocks.dbExecute.mock.calls[0][0].sql)).not.toContain(
      "SELECT *",
    );
    expect(res.body?.generation_meta).toEqual({
      metaTitle: "메타 제목",
      metaDescription: "메타 설명",
      schemaJson: undefined,
    });
    expect(res.body?.content).toEqual([
      "[TIP]팁 제목[/TIP]",
      "[링크](/blog/running-shoe-break-in-guide)",
    ]);
  });
});
