/**
 * @file admin-generate.ts
 * 관리자용 AI 콘텐츠 생성 API 엔드포인트.
 * Gemini API를 사용하여 블로그 포스트의 SEO 최적화된 콘텐츠를 자동 생성한다.
 * 주요 흐름: 인증 → 포스트 조회 → 동시 생성 잠금 → SEO 브리프 구성 → Gemini 호출 → 품질 검증 → DB 저장
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ensureContentSchema, tursoClient } from "./db.js";
import {
  buildQualityGate,
  buildSchemaJson,
  buildSeoBrief,
  type InternalLinkCandidate,
  type QualityGateResult,
  type SeoGenerationMetaInput,
  type SearchIntent,
} from "./seoPipeline.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** 내부 링크 추천 정보 — SEO 브리프에서 관련 포스트 간 연결에 사용 */
type InternalLinkSuggestion = {
  slug: string;
  title: string;
  anchor: string;
  reason: string;
};

/** 생성 메타데이터 — SEO 파이프라인의 입력값과 생성 후 결과를 통합 관리 */
type NormalizedGenerationMeta = SeoGenerationMetaInput & {
  originalTitle?: string;
  refinedTitle?: string;
  titleCandidates?: string[];
  serpQuery?: string;
  articleAngle?: string;
  serpSummary?: string;
  competitorHighlights?: string[];
  faqQuestions?: string[];
  sourceUrls?: string[];
  internalLinks?: InternalLinkSuggestion[];
  metaTitle?: string;
  metaDescription?: string;
  schemaType?: string;
  schemaJson?: Record<string, unknown>;
  qualityGate?: QualityGateResult;
};

type BlogPostRow = {
  id?: string | null;
  status?: string | null;
  generation_meta?: unknown;
  content_type?: string | null;
  workflow_status?: string | null;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
};

type GeneratedPayload = {
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  read_time: string;
  hero_image: string;
  faq: Array<{ question: string; answer: string }>;
  related_slugs: string[];
};

export class GenerationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GenerationError";
    this.status = status;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password, postId, options } = req.body || {};
  const envPass = (ADMIN_PASSWORD || "").trim();
  const inputPass = (password || "").trim();

  if (!envPass) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured" });
  }

  if (inputPass !== envPass) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!postId) {
    return res.status(400).json({ error: "postId is required" });
  }

  try {
    await generateContentForPost({ postId, options });

    return res.status(200).json({
      success: true,
      message: "Content generated and saved for review.",
      postId,
    });
  } catch (error: unknown) {
    const status = error instanceof GenerationError ? error.status : 500;
    return res.status(status).json({ error: getErrorMessage(error, "Failed to generate content") });
  }
}

/**
 * 특정 포스트에 대해 AI 콘텐츠를 생성하는 핵심 함수.
 * cron.ts 등 외부에서도 호출 가능하도록 export 되어 있다.
 * 동시 생성 방지를 위해 DB 레벨 잠금(generation_in_progress)을 사용한다.
 */
export async function generateContentForPost(input: { postId: string; options?: unknown }) {
  const { postId, options } = input;
  const geminiApiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!geminiApiKey) {
    throw new GenerationError(500, "GEMINI_API_KEY is not configured");
  }

  const logId = crypto.randomUUID();
  let generationLocked = false;

  try {
    await ensureContentSchema();

    const resultPost = await tursoClient.execute({
      sql: "SELECT * FROM blog_posts WHERE id = ?",
      args: [postId],
    });

    if (resultPost.rows.length === 0) {
      throw new GenerationError(404, "Post not found");
    }

    const post = resultPost.rows[0] as BlogPostRow;
    if (post.status === "published") {
      throw new GenerationError(
        409,
        "Published posts cannot be regenerated. Move the post back to draft before generating a new AI draft.",
      );
    }

    // 낙관적 잠금: 아직 생성 중이 아닌 포스트에만 잠금을 건다.
    // rowsAffected=0이면 이미 다른 요청이 생성 중이라는 뜻이므로 409 반환.
    const lockResult = await tursoClient.execute({
      sql: `UPDATE blog_posts
        SET generation_in_progress=1, generation_started_at=CURRENT_TIMESTAMP
        WHERE id=? AND COALESCE(generation_in_progress, 0)=0 AND status != 'published'`,
      args: [postId],
    });

    if ((lockResult.rowsAffected ?? 0) === 0) {
      throw new GenerationError(409, "Generation is already in progress for this post.");
    }

    generationLocked = true;

    const existingMeta = tryParse(post.generation_meta) || {};
    const generationMeta = normalizeGenerationMeta({ ...existingMeta, ...(options || {}) });
    const contentType = post.content_type || generationMeta.contentType || "blog";
    const originalTitle = String(post.title || "").trim();
    const slug = String(post.slug || "").trim();
    const internalLinkCandidates = await loadInternalLinkCandidates(postId);
    const seoBrief = await buildSeoBrief({
      title: originalTitle,
      contentType,
      generationMeta,
      internalLinkCandidates,
    });

    await tursoClient.execute({
      sql: `INSERT INTO content_generation_logs
        (id, post_id, status, content_type, workflow_status, requested_prompt, created_at)
        VALUES (?, ?, 'requested', ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        logId,
        postId,
        contentType,
        post.workflow_status || "idea",
        JSON.stringify({
          ...generationMeta,
          originalTitle,
          refinedTitle: seoBrief.refinedTitle,
          primaryKeyword: seoBrief.primaryKeyword,
          searchIntent: seoBrief.searchIntent,
        }),
      ],
    });

    // Gemini 2.5 Flash 모델로 SEO 최적화 콘텐츠 생성
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = buildPrompt({
      title: originalTitle,
      slug,
      excerpt: post.excerpt || undefined,
      contentType,
      generationMeta,
      seoBrief,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = stripJsonCodeBlock(text); // Gemini가 ```json 블록으로 감쌀 수 있으므로 제거
    const parsedContent = validateGeneratedPayload(JSON.parse(cleanText), generationMeta);
    const relatedSlugs =
      parsedContent.related_slugs.length > 0
        ? parsedContent.related_slugs
        : seoBrief.internalLinks.map((item) => item.slug);
    const finalTitle = parsedContent.title || seoBrief.refinedTitle || originalTitle;
    const schemaJson = buildSchemaJson({
      title: finalTitle,
      slug,
      excerpt: parsedContent.excerpt,
      faq: parsedContent.faq,
      content: parsedContent.content,
      heroImage: parsedContent.hero_image,
      seoBrief,
    });
    const qualityGate = buildQualityGate({
      generated: {
        ...parsedContent,
        related_slugs: relatedSlugs,
      },
      seoBrief,
      availableInternalLinks: internalLinkCandidates.length,
      editorRequiredSections: generationMeta.mustIncludeSections,
    });

    const mergedMeta = {
      ...generationMeta,
      originalTitle,
      refinedTitle: seoBrief.refinedTitle,
      titleCandidates: seoBrief.titleCandidates,
      primaryKeyword: seoBrief.primaryKeyword,
      seoKeywords: uniqueStrings([seoBrief.primaryKeyword, ...seoBrief.secondaryKeywords]),
      searchIntent: seoBrief.searchIntent,
      serpQuery: seoBrief.serpQuery,
      articleAngle: seoBrief.articleAngle,
      serpSummary: seoBrief.serpSummary,
      competitorHighlights: seoBrief.competitorHighlights,
      mustIncludeSections: seoBrief.mustIncludeSections,
      faqQuestions: seoBrief.faqQuestions,
      sourceUrls: seoBrief.supportingSourceUrls,
      internalLinks: seoBrief.internalLinks,
      metaTitle: seoBrief.metaTitle,
      metaDescription: seoBrief.metaDescription,
      schemaType: seoBrief.schemaType,
      schemaJson,
      qualityGate,
      lastPromptAt: new Date().toISOString(),
    } satisfies NormalizedGenerationMeta;

    await tursoClient.execute({
      sql: `UPDATE blog_posts SET
        title=?, excerpt=?, content=?, tags=?, read_time=?, hero_image=?, related_slugs=?, faq=?,
        content_type=?, workflow_status='reviewing', generation_meta=?, last_generated_at=CURRENT_TIMESTAMP,
        generation_count=COALESCE(generation_count, 0) + 1,
        generation_in_progress=0, generation_started_at=NULL, updated_at=CURRENT_TIMESTAMP
        WHERE id=?`,
      args: [
        finalTitle,
        parsedContent.excerpt,
        JSON.stringify(parsedContent.content),
        JSON.stringify(parsedContent.tags),
        parsedContent.read_time,
        parsedContent.hero_image,
        JSON.stringify(relatedSlugs),
        JSON.stringify(parsedContent.faq),
        contentType,
        JSON.stringify(mergedMeta),
        postId,
      ],
    });
    generationLocked = false;

    await tursoClient.execute({
      sql: `UPDATE content_generation_logs
        SET status='completed', workflow_status='reviewing', generated_title=?, completed_at=CURRENT_TIMESTAMP
        WHERE id=?`,
      args: [finalTitle, logId],
    });

    return {
      postId,
      contentType,
      generatedTitle: finalTitle,
      generationMeta: mergedMeta,
      qualityGate,
    };
  } catch (error: unknown) {
    console.error("[admin-generate] Error generating content:", error);

    try {
      await ensureContentSchema();
      await tursoClient.execute({
        sql: `UPDATE content_generation_logs
          SET status='failed', error_message=?, completed_at=CURRENT_TIMESTAMP
          WHERE id=?`,
        args: [getErrorMessage(error, "Failed to generate content"), logId],
      });
    } catch (logError) {
      console.error("[admin-generate] Failed to save generation log:", logError);
    }

    // 에러 발생 시 잠금을 해제하여 포스트가 영구 잠금 상태에 빠지지 않도록 한다
    if (generationLocked) {
      try {
        await releaseGenerationLock(postId);
      } catch (unlockError) {
        console.error("[admin-generate] Failed to release generation lock:", unlockError);
      }
    }

    throw error;
  }
}

function buildPrompt(input: {
  title: string;
  slug: string;
  excerpt?: string;
  contentType: string;
  generationMeta: NormalizedGenerationMeta;
  seoBrief: Awaited<ReturnType<typeof buildSeoBrief>>;
}) {
  const { title, slug, excerpt, contentType, generationMeta, seoBrief } = input;
  const keywordText = uniqueStrings([seoBrief.primaryKeyword, ...seoBrief.secondaryKeywords]).join(", ");
  const minimumBlocks = getMinimumBlockCount(generationMeta.length);
  const internalLinkText =
    seoBrief.internalLinks.length > 0
      ? seoBrief.internalLinks
          .map((link) => `- slug: ${link.slug} | title: ${link.title} | anchor: ${link.anchor} | reason: ${link.reason}`)
          .join("\n")
      : "- none";
  const sourceUrlText = seoBrief.supportingSourceUrls.length > 0 ? seoBrief.supportingSourceUrls.join("\n") : "none";
  const mustIncludeText = seoBrief.mustIncludeSections.length > 0 ? seoBrief.mustIncludeSections.join("\n") : "none";
  const competitorText = seoBrief.competitorHighlights.length > 0 ? seoBrief.competitorHighlights.join("\n") : "none";
  const faqQuestionText = seoBrief.faqQuestions.length > 0 ? seoBrief.faqQuestions.join("\n") : "none";

  return `
You are a senior Korean SEO editor and running-gear subject matter strategist.
Write a premium, publication-ready Korean article designed to satisfy search intent better than competing pages.
The article must feel expert-led, concrete, differentiated, and useful enough to deserve strong organic rankings over time.

Post context
- Original title: ${title}
- Refined working title: ${seoBrief.refinedTitle}
- Slug: ${slug}
- Existing excerpt: ${excerpt || "none"}
- Content type: ${contentType}
- Template: ${generationMeta.template}
- Target audience: ${generationMeta.targetAudience || "general runners"}
- Tone: ${generationMeta.tone}
- Length: ${generationMeta.length}
- Primary keyword: ${seoBrief.primaryKeyword || "none"}
- SEO keywords: ${keywordText || "none"}
- Search intent: ${seoBrief.searchIntent}
- CTA: ${generationMeta.cta || "none"}
- Article angle: ${seoBrief.articleAngle}
- SERP summary: ${seoBrief.serpSummary}
- Suggested meta title: ${seoBrief.metaTitle}
- Suggested meta description: ${seoBrief.metaDescription}

Content-type guidance
${getContentRules(contentType, generationMeta.template)}

Required sections
${mustIncludeText}

Competitor insights to beat
${competitorText}

Questions the FAQ should help answer
${faqQuestionText}

Fact-check source URLs
${sourceUrlText}

Allowed internal links
${internalLinkText}

Search quality requirements
- Infer the dominant search intent from the title and satisfy it completely.
- Structure the article to win on E-E-A-T: clear expertise, factual caution, practical details, and decision-supporting comparisons.
- Include information gain beyond generic AI content: specific scenarios, tradeoffs, buying criteria, mistakes, and action steps.
- Make the article skimmable for search visitors with strong headings, tables, checklists, and concise summary blocks where useful.
- The introduction must immediately answer the search query and explain who the article is for.
- Add at least one section that compares alternatives, benchmarks, or selection criteria in a non-obvious way.
- If the title implies commercial investigation, include buying factors, best-fit recommendations, and who should avoid each option.
- If the title implies informational intent, include definitions, process steps, pitfalls, and practical examples.
- Use SEO keywords naturally in title, excerpt, headings, body, FAQ, and checklist/table labels without stuffing.
- Avoid filler, vague superlatives, fabricated statistics, unverifiable claims, and repetitive phrasing.
- Write like an experienced human editor, not a generic AI summary.

Return valid JSON only. Do not wrap your answer in markdown.
Use exactly this schema:
{
  "title": "최종 제목",
  "excerpt": "1~2문장 요약",
  "content": [
    "본문 단락",
    "## 소제목",
    "[TIP]실용 팁[/TIP]",
    "[CHECKLIST]항목 1\\n항목 2[/CHECKLIST]",
    "[TABLE]항목|설명\\n예시|값[/TABLE]"
  ],
  "tags": ["태그1", "태그2", "태그3"],
  "read_time": "8분",
  "hero_image": "/assets/shoes/nb-1080.png",
  "related_slugs": ["existing-slug-1", "existing-slug-2"],
  "faq": [
    { "question": "질문", "answer": "답변" }
  ]
}

Hard rules
1. content length must be at least ${minimumBlocks} blocks.
2. The article must be specific, useful, and factually cautious.
3. Keep SEO keywords natural. Do not keyword-stuff.
4. FAQ must contain 3 to 5 items.
5. Choose hero_image from only these values:
   /assets/shoes/nb-1080.png
   /assets/shoes/nb-more.png
   /assets/shoes/asics-kayano.png
   /assets/shoes/hoka-bondi.png
   /assets/shoes/nike-pegasus.png
   /assets/shoes/saucony-speed.png
6. The output must be safe for human review before publication.
7. Every major section should add distinct value; avoid repeating the same advice in different words.
8. Prefer original wording and concrete decision criteria over generic motivational copy.
9. related_slugs may only contain slugs from the allowed internal links list above.
10. Use the refined working title unless there is a clearly better search-intent-preserving improvement.
11. If the Required sections list is not "none", include each required section as an explicit "## " heading using the same wording or a very close phrasing.
`;
}

function getContentRules(contentType: string, template: string) {
  if (contentType === "review") {
    return `
- This is a shoe review. Cover fit, cushioning, stability, ride feel, strengths, weaknesses, and ideal users.
- Add a comparison table if it helps users choose between alternatives.
- End with a verdict and purchase-fit guidance.
- Template emphasis: ${template}.`;
  }

  if (contentType === "utility") {
    return `
- This is a utility/help article. Focus on steps, formulas, conversion logic, or practical instructions.
- Use checklist or table blocks when they improve clarity.
- Include common mistakes and practical examples.
- Template emphasis: ${template}.`;
  }

  return `
- This is a blog article. Use a strong search-intent structure with a definitive answer near the top.
- Include one checklist or table block when useful.
- Add a section covering common mistakes or misconceptions.
- End with a short CTA section aligned to the provided CTA.
- Template emphasis: ${template}.`;
}

/** Gemini 응답에서 ```json ... ``` 마크다운 래핑을 제거한다 */
function stripJsonCodeBlock(text: string) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
  else if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
  if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
  return cleanText.trim();
}

/** 콘텐츠 길이 설정에 따른 최소 블록 수 — short:10, medium:14, long:18 */
export function getMinimumBlockCount(length: NormalizedGenerationMeta["length"]) {
  return length === "short" ? 10 : length === "long" ? 18 : 14;
}

/**
 * Gemini가 생성한 JSON 페이로드를 검증하고 정규화한다.
 * 최소 블록 수, FAQ 개수(3~5) 등 하드 룰을 적용하며, 위반 시 에러를 던진다.
 */
export function validateGeneratedPayload(
  payload: unknown,
  generationMeta: Pick<NormalizedGenerationMeta, "length">,
) {
  const source = isRecord(payload) ? payload : {};
  const content = Array.isArray(source.content)
    ? source.content.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];
  const minimumBlocks = getMinimumBlockCount(generationMeta.length);
  if (content.length < minimumBlocks) {
    throw new Error(`Generated content must contain at least ${minimumBlocks} content blocks`);
  }

  const tags = Array.isArray(source.tags)
    ? source.tags.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];

  const faq = Array.isArray(source.faq)
    ? source.faq
        .map((item: unknown) => {
          const faqItem = isRecord(item) ? item : {};
          const question = String(faqItem.question || "").trim();
          const answer = String(faqItem.answer || "").trim();
          return question && answer ? { question, answer } : null;
        })
        .filter((item): item is { question: string; answer: string } => item !== null)
    : [];
  const relatedSlugs = Array.isArray(source.related_slugs)
    ? source.related_slugs.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];

  if (faq.length < 3 || faq.length > 5) {
    throw new Error("Generated FAQ must contain between 3 and 5 items");
  }

  return {
    title: String(source.title || "").trim(),
    excerpt: String(source.excerpt || "").trim(),
    content,
    tags,
    read_time: String(source.read_time || estimateReadTime(content)).trim(),
    hero_image: validateHeroImage(source.hero_image),
    faq,
    related_slugs: uniqueStrings(relatedSlugs).slice(0, 5),
  } satisfies GeneratedPayload;
}

async function releaseGenerationLock(postId: string) {
  await tursoClient.execute({
    sql: `UPDATE blog_posts
      SET generation_in_progress=0, generation_started_at=NULL
      WHERE id=?`,
    args: [postId],
  });
}

function validateHeroImage(value: unknown) {
  const allowed = new Set([
    "/assets/shoes/nb-1080.png",
    "/assets/shoes/nb-more.png",
    "/assets/shoes/asics-kayano.png",
    "/assets/shoes/hoka-bondi.png",
    "/assets/shoes/nike-pegasus.png",
    "/assets/shoes/saucony-speed.png",
  ]);

  const candidate = String(value || "");
  return allowed.has(candidate) ? candidate : "/assets/shoes/nb-1080.png";
}

function estimateReadTime(content: unknown[]) {
  const joined = Array.isArray(content) ? content.join(" ") : "";
  const minutes = Math.max(6, Math.round(joined.length / 250));
  return `${minutes}분`;
}

function tryParse(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** 외부 입력(관리자 옵션 + DB 메타)을 안전한 기본값으로 정규화한다 */
function normalizeGenerationMeta(meta: unknown): NormalizedGenerationMeta {
  const source = isRecord(meta) ? meta : {};
  const rawLength = String(source.length || "medium");
  const normalizedLength =
    rawLength === "short" || rawLength === "long" ? rawLength : "medium";

  return {
    template: String(source.template || "guide"),
    targetAudience: String(source.targetAudience || ""),
    tone: String(source.tone || "expert"),
    length: normalizedLength,
    seoKeywords: normalizeListInput(source.seoKeywords),
    cta: String(source.cta || ""),
    contentType:
      source.contentType === "review" || source.contentType === "utility" ? source.contentType : "blog",
    primaryKeyword: String(source.primaryKeyword || "").trim(),
    searchIntent: normalizeSearchIntent(source.searchIntent),
    competitorUrls: normalizeListInput(source.competitorUrls),
    referenceUrls: normalizeListInput(source.referenceUrls),
    mustIncludeSections: normalizeListInput(source.mustIncludeSections),
    originalTitle: String(source.originalTitle || "").trim() || undefined,
    refinedTitle: String(source.refinedTitle || "").trim() || undefined,
    titleCandidates: normalizeListInput(source.titleCandidates),
    serpQuery: String(source.serpQuery || "").trim() || undefined,
    articleAngle: String(source.articleAngle || "").trim() || undefined,
    serpSummary: String(source.serpSummary || "").trim() || undefined,
    competitorHighlights: normalizeListInput(source.competitorHighlights),
    faqQuestions: normalizeListInput(source.faqQuestions),
    sourceUrls: normalizeListInput(source.sourceUrls),
    internalLinks: normalizeInternalLinks(source.internalLinks),
    metaTitle: String(source.metaTitle || "").trim() || undefined,
    metaDescription: String(source.metaDescription || "").trim() || undefined,
    schemaType: String(source.schemaType || "").trim() || undefined,
    schemaJson: isRecord(source.schemaJson) ? source.schemaJson : undefined,
    qualityGate: isQualityGate(source.qualityGate) ? source.qualityGate : undefined,
  };
}

function normalizeListInput(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeInternalLinks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      const slug = String(item.slug || "").trim();
      const title = String(item.title || "").trim();
      const anchor = String(item.anchor || "").trim();
      const reason = String(item.reason || "").trim();
      if (!slug || !title || !anchor) return null;
      return { slug, title, anchor, reason };
    })
    .filter((item): item is InternalLinkSuggestion => item !== null);
}

function normalizeSearchIntent(value: unknown): SearchIntent {
  const intent = String(value || "").trim().toLowerCase();
  if (
    intent === "informational" ||
    intent === "commercial" ||
    intent === "transactional" ||
    intent === "comparison" ||
    intent === "local"
  ) {
    return intent;
  }
  return "auto";
}

function isQualityGate(value: unknown): value is QualityGateResult {
  if (!isRecord(value)) return false;
  return typeof value.passed === "boolean" && typeof value.score === "number";
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

/** 현재 포스트를 제외하고, 게시 완료된 포스트 중 내부 링크 후보를 최대 12개 조회한다 */
async function loadInternalLinkCandidates(postId: string) {
  const result = await tursoClient.execute({
    sql: `SELECT slug, title, excerpt, tags
          FROM blog_posts
          WHERE status = 'published'
            AND workflow_status = 'approved'
            AND id != ?
          ORDER BY published_at DESC
          LIMIT 12`,
    args: [postId],
  });

  return result.rows
    .map((row) => {
      const source = isRecord(row) ? row : {};
      const parsedTags = tryParse(source.tags);
      return {
        slug: String(source.slug || "").trim(),
        title: String(source.title || "").trim(),
        excerpt: String(source.excerpt || "").trim(),
        tags: Array.isArray(parsedTags)
          ? parsedTags.map((item: unknown) => String(item).trim()).filter(Boolean)
          : [],
      } satisfies InternalLinkCandidate;
    })
    .filter((item) => item.slug && item.title);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
