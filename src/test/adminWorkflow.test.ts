// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const mocks = vi.hoisted(() => ({
  dbExecute: vi.fn(),
  ensureContentSchema: vi.fn(),
  generateContent: vi.fn(),
  getGenerativeModel: vi.fn(),
  interactionCreate: vi.fn(),
}));

vi.mock("../../api/db.js", () => ({
  ensureContentSchema: mocks.ensureContentSchema,
  tursoClient: {
    execute: mocks.dbExecute,
  },
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mocks.getGenerativeModel,
  })),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn(() => ({
    interactions: {
      create: mocks.interactionCreate,
    },
  })),
}));

function createSeoInteraction(overrides?: Record<string, unknown>) {
  return {
    outputs: [
      {
        type: "text",
        text: JSON.stringify({
          refinedTitle: "Refined title",
          titleCandidates: ["Refined title", "Candidate 2", "Candidate 3"],
          primaryKeyword: "러닝화 추천",
          secondaryKeywords: ["발볼 넓은 러닝화"],
          searchIntent: "informational",
          serpQuery: "러닝화 추천",
          articleAngle: "Beat generic roundups with practical buying advice.",
          serpSummary: "Top results are generic; this article should be more specific.",
          competitorHighlights: ["Most results are generic."],
          mustIncludeSections: ["핵심 요약", "선택 기준", "실수하기 쉬운 부분"],
          faqQuestions: ["질문 1", "질문 2", "질문 3"],
          supportingSourceUrls: ["https://example.com/source-1", "https://example.com/source-2"],
          internalLinks: [
            {
              slug: "beginner-running-shoe-guide",
              title: "Beginner running shoe guide",
              anchor: "초보 러닝화 가이드",
              reason: "Relevant internal support article.",
            },
          ],
          metaTitle: "러닝화 추천 완벽 가이드 | 런닝화매니아",
          metaDescription: "러닝화 추천을 위한 선택 기준, 실수 방지 포인트, 추천 대상을 정리한 고급 가이드입니다.",
          schemaType: "Article",
          ...overrides,
        }),
        annotations: [
          { source: "https://example.com/source-1" },
          { source: "https://example.com/source-2" },
        ],
      },
    ],
  };
}

function createRequest(
  body: unknown,
  method = "POST",
  extra: Partial<{ headers: Record<string, string>; query: Record<string, string> }> = {},
) {
  return {
    method,
    body,
    headers: extra.headers ?? {},
    query: extra.query ?? {},
  } as unknown as VercelRequest;
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  } as unknown as VercelResponse & {
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
  };
}

describe("admin workflow guards", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.ADMIN_PASSWORD = "secret";
    process.env.GEMINI_API_KEY = "gemini-key";
    delete process.env.CRON_SECRET;
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;

    mocks.ensureContentSchema.mockResolvedValue(undefined);
    mocks.dbExecute.mockResolvedValue({ rows: [], rowsAffected: 1 });
    mocks.getGenerativeModel.mockReturnValue({
      generateContent: mocks.generateContent,
    });
    mocks.interactionCreate.mockResolvedValue(createSeoInteraction());
  });

  it("rejects publishing a post that is not approved", async () => {
    mocks.dbExecute.mockResolvedValueOnce({
      rows: [{ id: "post-1", workflow_status: "reviewing" }],
    });

    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "publish",
        data: { id: "post-1" },
      }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: "Only approved posts can be published" });
    expect(mocks.dbExecute).toHaveBeenCalledTimes(1);
  });

  it("does not auto-approve while publishing", async () => {
    mocks.dbExecute
      .mockResolvedValueOnce({
        rows: [{ id: "post-1", workflow_status: "approved" }],
      })
      .mockResolvedValueOnce({ rowsAffected: 1 });

    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "publish",
        data: { id: "post-1" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(mocks.dbExecute.mock.calls[1][0].sql).toContain("SET status='published'");
    expect(mocks.dbExecute.mock.calls[1][0].sql).not.toContain("workflow_status='approved'");
  });

  it("rejects moving a published post back to review", async () => {
    mocks.dbExecute.mockResolvedValueOnce({
      rows: [{ id: "post-1", status: "published" }],
    });

    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "update_workflow",
        data: { id: "post-1", workflow_status: "reviewing" },
      }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: "Published posts must be moved back to draft before changing workflow",
    });
  });

  it("only exposes approved published posts from the public posts API", async () => {
    mocks.dbExecute.mockResolvedValueOnce({
      rows: [
        {
          id: "post-1",
          content: '["block"]',
          tags: '["tag"]',
          related_slugs: "[]",
          faq: "[]",
        },
      ],
    });

    const { default: handler } = await import("../../api/posts.ts");
    const res = createResponse();

    await handler(createRequest(undefined, "GET"), res);

    expect(res.statusCode).toBe(200);
    expect(String(mocks.dbExecute.mock.calls[0][0])).toContain("workflow_status = 'approved'");
  });

  it("rejects AI generation for published posts", async () => {
    mocks.dbExecute.mockResolvedValueOnce({
      rows: [
        {
          id: "post-1",
          status: "published",
          workflow_status: "approved",
          generation_meta: "{}",
          content_type: "blog",
          title: "Published title",
          slug: "published-title",
          excerpt: "Summary",
        },
      ],
    });

    const { default: handler } = await import("../../api/admin-generate.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        postId: "post-1",
        options: {},
      }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: "Published posts cannot be regenerated. Move the post back to draft before generating a new AI draft.",
    });
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it("rejects a second generation request while one is already in progress", async () => {
    mocks.dbExecute
      .mockResolvedValueOnce({
        rows: [
          {
            id: "post-1",
            status: "draft",
            workflow_status: "idea",
            generation_meta: "{}",
            content_type: "blog",
            title: "Draft title",
            slug: "draft-title",
            excerpt: "Summary",
          },
        ],
      })
      .mockResolvedValueOnce({ rowsAffected: 0 });

    const { default: handler } = await import("../../api/admin-generate.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        postId: "post-1",
        options: {},
      }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: "Generation is already in progress for this post.",
    });
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it("enforces content length and FAQ count for generated payloads", async () => {
    const { validateGeneratedPayload } = await import("../../api/admin-generate.ts");
    const faq = [
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
      { question: "Q3", answer: "A3" },
    ];

    expect(() =>
      validateGeneratedPayload(
        {
          title: "Title",
          excerpt: "Excerpt",
          content: Array.from({ length: 13 }, (_, index) => `Block ${index + 1}`),
          tags: ["tag"],
          faq,
        },
        { length: "medium" },
      ),
    ).toThrow("at least 14 content blocks");

    expect(() =>
      validateGeneratedPayload(
        {
          title: "Title",
          excerpt: "Excerpt",
          content: Array.from({ length: 14 }, (_, index) => `Block ${index + 1}`),
          tags: ["tag"],
          faq: faq.slice(0, 2),
        },
        { length: "medium" },
      ),
    ).toThrow("between 3 and 5 items");
  });

  it("requires scheduled_at for scheduled posts", async () => {
    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "create",
        data: {
          title: "Scheduled post",
          slug: "scheduled-post",
          status: "scheduled",
          workflow_status: "approved",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Scheduled posts require scheduled_at" });
  });

  it("requires approval before scheduling a post", async () => {
    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "create",
        data: {
          title: "Scheduled post",
          slug: "scheduled-post",
          status: "scheduled",
          workflow_status: "reviewing",
          scheduled_at: "2026-03-14T00:00",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: "Scheduled posts must be approved before scheduling" });
  });

  it("persists scheduled_at for scheduled posts", async () => {
    mocks.dbExecute.mockResolvedValueOnce({ rowsAffected: 1 });

    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "create",
        data: {
          title: "Scheduled post",
          slug: "scheduled-post",
          status: "scheduled",
          workflow_status: "approved",
          scheduled_at: "2026-03-14T09:30",
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(mocks.dbExecute.mock.calls[0][0].sql).toContain("scheduled_at");
    expect(mocks.dbExecute.mock.calls[0][0].args[14]).toBe("2026-03-14T00:30:00.000Z");
  });

  it("bulk pipeline generates and schedules posts in one action", async () => {
    mocks.interactionCreate.mockResolvedValueOnce(
      createSeoInteraction({
        refinedTitle: "Bulk pipeline title",
        primaryKeyword: "Bulk pipeline title",
        secondaryKeywords: ["bulk pipeline"],
        metaTitle: "Bulk pipeline title | 런닝화매니아",
        metaDescription:
          "Bulk pipeline title에 대한 선택 기준, 비교 포인트, 실수 방지 팁을 담아 자동 승인 가능한 품질 기준을 충족하도록 설계된 테스트 설명입니다.",
      }),
    );

    mocks.dbExecute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rowsAffected: 1 })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "post-1",
            status: "draft",
            workflow_status: "idea",
            generation_meta: "{}",
            content_type: "blog",
            title: "Bulk pipeline title",
            slug: "bulk-pipeline-title",
            excerpt: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rowsAffected: 1 });
    mocks.generateContent.mockResolvedValueOnce({
      response: {
        text: () =>
          JSON.stringify({
            title: "Bulk pipeline title",
            excerpt: "Excerpt",
            content: [
              "## 핵심 요약",
              "핵심 요약 내용",
              "## 선택 기준",
              "선택 기준 내용",
              "## 실수하기 쉬운 부분",
              "실수하기 쉬운 부분 설명",
              "## 추천 대상",
              "추천 대상 설명",
              "[CHECKLIST]항목 1\n항목 2[/CHECKLIST]",
              "추가 본문 1",
              "추가 본문 2",
              "추가 본문 3",
              "추가 본문 4",
              "추가 본문 5",
              "추가 본문 6",
              "추가 본문 7",
            ],
            tags: ["tag-1", "tag-2"],
            read_time: "8분",
            hero_image: "/assets/shoes/nb-1080.png",
            related_slugs: ["beginner-running-shoe-guide"],
            faq: [
              { question: "Q1", answer: "A1" },
              { question: "Q2", answer: "A2" },
              { question: "Q3", answer: "A3" },
            ],
          }),
      },
    });

    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "bulk_pipeline",
        data: {
          titles: ["Bulk pipeline title"],
          content_type: "blog",
          generation_meta: {
            template: "authority",
            tone: "expert",
            length: "medium",
            seoKeywords: ["러닝화 추천"],
          },
          auto_generate: true,
          auto_schedule: true,
          first_scheduled_at: "2026-03-14T09:30",
          schedule_interval_hours: 12,
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      created: 1,
      generated: 1,
      scheduled: 1,
      failed: 0,
    });
    expect((res.body as { results: Array<{ status: string; workflow_status: string; scheduled_at: string }> }).results[0]).toMatchObject({
      status: "scheduled",
      workflow_status: "approved",
      scheduled_at: "2026-03-14T00:30:00.000Z",
    });
    expect(
      mocks.dbExecute.mock.calls.some(
        (call) => typeof call[0]?.sql === "string" && call[0].sql.includes("workflow_status='approved'"),
      ),
    ).toBe(true);
  });

  it("bulk pipeline keeps failed generations as drafts and reports the error", async () => {
    mocks.dbExecute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rowsAffected: 1 })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "post-1",
            status: "draft",
            workflow_status: "idea",
            generation_meta: "{}",
            content_type: "blog",
            title: "Broken generation title",
            slug: "broken-generation-title",
            excerpt: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rowsAffected: 1 });
    mocks.generateContent.mockRejectedValueOnce(new Error("Gemini down"));

    const { default: handler } = await import("../../api/admin-blog.ts");
    const res = createResponse();

    await handler(
      createRequest({
        password: "secret",
        action: "bulk_pipeline",
        data: {
          titles: ["Broken generation title"],
          content_type: "blog",
          generation_meta: {
            template: "authority",
            tone: "expert",
            length: "medium",
          },
          auto_generate: true,
          auto_schedule: true,
          first_scheduled_at: "2026-03-14T09:30",
          schedule_interval_hours: 12,
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      created: 1,
      generated: 0,
      scheduled: 0,
      failed: 1,
    });
    expect((res.body as { results: Array<{ status: string; workflow_status: string; error: string }> }).results[0]).toMatchObject({
      status: "draft",
      workflow_status: "idea",
      error: "Gemini down",
    });
  });

  it("fails closed when CRON_SECRET is missing", async () => {
    delete process.env.CRON_SECRET;

    const { default: handler } = await import("../../api/cron.ts");
    const res = createResponse();

    await handler(
      createRequest(undefined, "POST", {
        headers: { authorization: "Bearer anything" },
      }),
      res,
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "CRON_SECRET is not configured" });
    expect(mocks.dbExecute).not.toHaveBeenCalled();
  });

  it("rejects cron requests with an invalid bearer token", async () => {
    process.env.CRON_SECRET = "cron-secret";

    const { default: handler } = await import("../../api/cron.ts");
    const res = createResponse();

    await handler(
      createRequest(undefined, "POST", {
        headers: { authorization: "Bearer wrong-secret" },
      }),
      res,
    );

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mocks.dbExecute).not.toHaveBeenCalled();
  });

  it("publishes due scheduled posts before interval-gated drafts", async () => {
    process.env.CRON_SECRET = "cron-secret";
    mocks.dbExecute
      .mockResolvedValueOnce({
        rows: [{ auto_publish_enabled: 1, publish_interval_hours: 24 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: "post-1", title: "Scheduled", slug: "scheduled-post" }],
      })
      .mockResolvedValueOnce({ rowsAffected: 1 });

    const { default: handler } = await import("../../api/cron.ts");
    const res = createResponse();

    await handler(
      createRequest(undefined, "POST", {
        headers: { authorization: "Bearer cron-secret" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Published one scheduled post",
      publishedPost: "scheduled-post",
    });
    expect(mocks.dbExecute).toHaveBeenCalledTimes(3);
    expect(mocks.dbExecute.mock.calls[1][0].sql).toContain("status = 'scheduled'");
  });

  it("does not accept debug-env auth from the query string", async () => {
    process.env.CRON_SECRET = "cron-secret";

    const { default: handler } = await import("../../api/debug-env.ts");
    const res = createResponse();

    await handler(
      createRequest(undefined, "POST", {
        query: { password: "secret" },
      }),
      res,
    );

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns only boolean environment flags from debug-env", async () => {
    process.env.CRON_SECRET = "cron-secret";

    const { default: handler } = await import("../../api/debug-env.ts");
    const res = createResponse();

    await handler(
      createRequest({ password: "secret" }, "POST"),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      adminPasswordSet: true,
      tursoDatabaseUrlSet: false,
      tursoAuthTokenSet: false,
      geminiApiKeySet: true,
      cronSecretSet: true,
    });
    expect(res.body).not.toHaveProperty("geminiApiKeyLength");
  });
});
