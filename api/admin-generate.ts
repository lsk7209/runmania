import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ensureContentSchema, tursoClient } from "./db.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

type NormalizedGenerationMeta = {
  template: string;
  targetAudience: string;
  tone: string;
  length: "short" | "medium" | "long";
  seoKeywords: string[];
  cta: string;
  contentType: "blog" | "review" | "utility";
};

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

  const geminiApiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!geminiApiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  let logId = crypto.randomUUID();

  try {
    await ensureContentSchema();

    const resultPost = await tursoClient.execute({
      sql: "SELECT * FROM blog_posts WHERE id = ?",
      args: [postId],
    });

    if (resultPost.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = resultPost.rows[0] as any;
    const existingMeta = tryParse(post.generation_meta) || {};
    const generationMeta = normalizeGenerationMeta({ ...existingMeta, ...(options || {}) });
    const contentType = post.content_type || generationMeta.contentType || "blog";

    await tursoClient.execute({
      sql: `INSERT INTO content_generation_logs
        (id, post_id, status, content_type, workflow_status, requested_prompt, created_at)
        VALUES (?, ?, 'requested', ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        logId,
        postId,
        contentType,
        post.workflow_status || "idea",
        JSON.stringify(generationMeta),
      ],
    });

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = buildPrompt({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentType,
      generationMeta,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = stripJsonCodeBlock(text);
    const parsedContent = validateGeneratedPayload(JSON.parse(cleanText));

    const mergedMeta = {
      ...generationMeta,
      lastPromptAt: new Date().toISOString(),
    };

    await tursoClient.execute({
      sql: `UPDATE blog_posts SET
        title=?, excerpt=?, content=?, tags=?, read_time=?, hero_image=?, faq=?,
        content_type=?, workflow_status='reviewing', generation_meta=?, last_generated_at=CURRENT_TIMESTAMP,
        generation_count=COALESCE(generation_count, 0) + 1, updated_at=CURRENT_TIMESTAMP
        WHERE id=?`,
      args: [
        parsedContent.title || post.title,
        parsedContent.excerpt,
        JSON.stringify(parsedContent.content),
        JSON.stringify(parsedContent.tags),
        parsedContent.read_time,
        parsedContent.hero_image,
        JSON.stringify(parsedContent.faq),
        contentType,
        JSON.stringify(mergedMeta),
        postId,
      ],
    });

    await tursoClient.execute({
      sql: `UPDATE content_generation_logs
        SET status='completed', workflow_status='reviewing', generated_title=?, completed_at=CURRENT_TIMESTAMP
        WHERE id=?`,
      args: [parsedContent.title || post.title, logId],
    });

    return res.status(200).json({
      success: true,
      message: "Content generated and saved for review.",
      postId,
    });
  } catch (error: any) {
    console.error("[admin-generate] Error generating content:", error);

    try {
      await ensureContentSchema();
      await tursoClient.execute({
        sql: `UPDATE content_generation_logs
          SET status='failed', error_message=?, completed_at=CURRENT_TIMESTAMP
          WHERE id=?`,
        args: [error.message || "Failed to generate content", logId],
      });
    } catch (logError) {
      console.error("[admin-generate] Failed to save generation log:", logError);
    }

    return res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}

function buildPrompt(input: {
  title: string;
  slug: string;
  excerpt?: string;
  contentType: string;
  generationMeta: NormalizedGenerationMeta;
}) {
  const { title, slug, excerpt, contentType, generationMeta } = input;
  const keywordText = generationMeta.seoKeywords.join(", ");
  const minimumBlocks =
    generationMeta.length === "short" ? 10 : generationMeta.length === "long" ? 18 : 14;

  return `
You are an expert Korean content strategist and editor for a running shoe website.
Write production-ready content in Korean for direct use by a human editor.

Post context
- Title: ${title}
- Slug: ${slug}
- Existing excerpt: ${excerpt || "none"}
- Content type: ${contentType}
- Template: ${generationMeta.template}
- Target audience: ${generationMeta.targetAudience || "general runners"}
- Tone: ${generationMeta.tone}
- Length: ${generationMeta.length}
- SEO keywords: ${keywordText || "none"}
- CTA: ${generationMeta.cta || "none"}

Content-type guidance
${getContentRules(contentType, generationMeta.template)}

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
- This is a blog article. Use a strong search-intent structure with clear sections and practical takeaways.
- Include one checklist or table block when useful.
- End with a short CTA section aligned to the provided CTA.
- Template emphasis: ${template}.`;
}

function stripJsonCodeBlock(text: string) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
  else if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
  if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
  return cleanText.trim();
}

function validateGeneratedPayload(payload: any) {
  const content = Array.isArray(payload?.content)
    ? payload.content.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];
  if (content.length < 10) {
    throw new Error("Generated content is too short");
  }

  const tags = Array.isArray(payload?.tags)
    ? payload.tags.map((item: unknown) => String(item).trim()).filter(Boolean)
    : [];

  const faq = Array.isArray(payload?.faq)
    ? payload.faq
        .map((item: any) => ({
          question: String(item?.question || "").trim(),
          answer: String(item?.answer || "").trim(),
        }))
        .filter((item: { question: string; answer: string }) => item.question && item.answer)
    : [];

  return {
    title: String(payload?.title || "").trim(),
    excerpt: String(payload?.excerpt || "").trim(),
    content,
    tags,
    read_time: String(payload?.read_time || estimateReadTime(content)).trim(),
    hero_image: validateHeroImage(payload?.hero_image),
    faq,
  };
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

function normalizeGenerationMeta(meta: any): NormalizedGenerationMeta {
  const rawLength = String(meta?.length || "medium");
  const normalizedLength =
    rawLength === "short" || rawLength === "long" ? rawLength : "medium";

  return {
    template: meta?.template || "guide",
    targetAudience: meta?.targetAudience || "",
    tone: meta?.tone || "expert",
    length: normalizedLength,
    seoKeywords: Array.isArray(meta?.seoKeywords)
      ? meta.seoKeywords.map((item: unknown) => String(item).trim()).filter(Boolean)
      : String(meta?.seoKeywords || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    cta: meta?.cta || "",
    contentType: meta?.contentType || "blog",
  };
}
