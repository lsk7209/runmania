import { GoogleGenAI } from "@google/genai";

export type SearchIntent =
  | "auto"
  | "informational"
  | "commercial"
  | "transactional"
  | "comparison"
  | "local";

export type InternalLinkCandidate = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export type InternalLinkSuggestion = {
  slug: string;
  title: string;
  anchor: string;
  reason: string;
};

export type QualityGateCheck = {
  label: string;
  passed: boolean;
  severity: "blocker" | "warning";
  detail: string;
};

export type QualityGateResult = {
  passed: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
  checks: QualityGateCheck[];
};

export type SeoBrief = {
  refinedTitle: string;
  titleCandidates: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: Exclude<SearchIntent, "auto">;
  serpQuery: string;
  articleAngle: string;
  serpSummary: string;
  competitorHighlights: string[];
  mustIncludeSections: string[];
  faqQuestions: string[];
  supportingSourceUrls: string[];
  internalLinks: InternalLinkSuggestion[];
  metaTitle: string;
  metaDescription: string;
  schemaType: "Article" | "HowTo" | "Review";
};

export type SeoGenerationMetaInput = {
  template: string;
  targetAudience: string;
  tone: string;
  length: "short" | "medium" | "long";
  seoKeywords: string[];
  cta: string;
  contentType: "blog" | "review" | "utility";
  primaryKeyword: string;
  searchIntent: SearchIntent;
  competitorUrls: string[];
  referenceUrls: string[];
  mustIncludeSections: string[];
};

export type GeneratedContentForQualityGate = {
  title: string;
  excerpt: string;
  content: string[];
  faq: Array<{ question: string; answer: string }>;
  related_slugs: string[];
  read_time: string;
};

let seoClient: GoogleGenAI | null = null;

export async function buildSeoBrief(input: {
  title: string;
  contentType: "blog" | "review" | "utility";
  generationMeta: SeoGenerationMetaInput;
  internalLinkCandidates: InternalLinkCandidate[];
}) {
  const fallback = buildFallbackSeoBrief(input);
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return fallback;
  }

  try {
    const client = getSeoClient(apiKey);
    const interaction = await client.interactions.create({
      model: "gemini-2.5-flash",
      input: buildSeoResearchPrompt(input),
      system_instruction:
        "You are an elite Korean SEO strategist. Research the live web, infer search intent, and return JSON only.",
      tools: [{ type: "google_search", search_types: ["web_search"] }],
    });

    const textOutput = extractInteractionText(interaction.outputs);
    const parsed = parseJsonBlock(textOutput);
    const extractedSourceUrls = uniqueStrings([
      ...extractAnnotationSources(interaction.outputs),
      ...extractSearchResultUrls(interaction.outputs),
      ...input.generationMeta.competitorUrls,
      ...input.generationMeta.referenceUrls,
    ]);

    return normalizeSeoBrief(parsed, input, extractedSourceUrls);
  } catch (error) {
    console.error("[seoPipeline] Falling back to heuristic SEO brief:", error);
    return fallback;
  }
}

export function buildQualityGate(input: {
  generated: GeneratedContentForQualityGate;
  seoBrief: SeoBrief;
  availableInternalLinks: number;
  editorRequiredSections: string[];
}) {
  const { generated, seoBrief, availableInternalLinks, editorRequiredSections } = input;
  const headings = generated.content
    .filter((block) => block.startsWith("## "))
    .map((block) => block.replace(/^##\s*/, "").trim());
  const normalizedFullText = normalizeForMatch(
    [generated.title, generated.excerpt, ...generated.content, ...generated.faq.map((item) => `${item.question} ${item.answer}`)].join(" "),
  );
  const normalizedHeadings = headings.map((heading) => normalizeForMatch(heading));
  const missingEditorSections = editorRequiredSections.filter((section) =>
    !normalizedHeadings.some((heading) => heading.includes(normalizeForMatch(section))),
  );
  const missingSuggestedSections = seoBrief.mustIncludeSections.filter((section) =>
    !headings.some((heading) => normalizeForMatch(heading).includes(normalizeForMatch(section))),
  );

  const checks: QualityGateCheck[] = [
    {
      label: "Primary keyword coverage",
      passed: !seoBrief.primaryKeyword || hasKeywordCoverage(normalizedFullText, seoBrief.primaryKeyword),
      severity: "blocker",
      detail: seoBrief.primaryKeyword
        ? `Primary keyword "${seoBrief.primaryKeyword}" should appear in the title or body.`
        : "No explicit primary keyword was provided.",
    },
    {
      label: "Editor-required sections",
      passed: missingEditorSections.length === 0,
      severity: "blocker",
      detail:
        missingEditorSections.length === 0
          ? "All editor-required sections are present."
          : `Missing required sections: ${missingEditorSections.join(", ")}`,
    },
    {
      label: "Suggested SEO sections",
      passed: missingSuggestedSections.length === 0,
      severity: "warning",
      detail:
        missingSuggestedSections.length === 0
          ? "Suggested SEO sections are covered."
          : `Suggested sections not fully covered: ${missingSuggestedSections.join(", ")}`,
    },
    {
      label: "Fact validation sources",
      passed: seoBrief.supportingSourceUrls.length >= 2,
      severity: "blocker",
      detail:
        seoBrief.supportingSourceUrls.length >= 2
          ? `${seoBrief.supportingSourceUrls.length} source URLs available for fact checking.`
          : "At least 2 supporting source URLs are required.",
    },
    {
      label: "Internal link recommendations",
      passed: generated.related_slugs.length > 0 || availableInternalLinks === 0,
      severity: "warning",
      detail:
        availableInternalLinks === 0
          ? "No published internal link candidates were available."
          : generated.related_slugs.length > 0
          ? `${generated.related_slugs.length} related internal links selected.`
          : "No internal links were selected for the article.",
    },
    {
      label: "Meta title quality",
      passed: seoBrief.metaTitle.length >= 35 && seoBrief.metaTitle.length <= 65,
      severity: "warning",
      detail: `Meta title length is ${seoBrief.metaTitle.length} characters.`,
    },
    {
      label: "Meta description quality",
      passed: seoBrief.metaDescription.length >= 90 && seoBrief.metaDescription.length <= 170,
      severity: "warning",
      detail: `Meta description length is ${seoBrief.metaDescription.length} characters.`,
    },
    {
      label: "Structured blocks",
      passed: generated.content.some((block) => block.includes("[CHECKLIST]") || block.includes("[TABLE]")),
      severity: "warning",
      detail: "Content should include at least one checklist or table block.",
    },
  ];

  const blockers = checks.filter((check) => check.severity === "blocker" && !check.passed).map((check) => check.detail);
  const warnings = checks.filter((check) => check.severity === "warning" && !check.passed).map((check) => check.detail);
  const passedChecks = checks.filter((check) => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    passed: blockers.length === 0,
    score,
    blockers,
    warnings,
    checks,
  } satisfies QualityGateResult;
}

export function buildSchemaJson(input: {
  title: string;
  slug: string;
  excerpt: string;
  faq: Array<{ question: string; answer: string }>;
  content: string[];
  heroImage: string;
  seoBrief: SeoBrief;
}) {
  const { title, slug, excerpt, faq, content, heroImage, seoBrief } = input;
  const baseUrl = "https://www.runmania.kr";
  const headings = content.filter((block) => block.startsWith("## ")).map((block) => block.replace(/^##\s*/, "").trim());
  const articleType = seoBrief.schemaType === "HowTo" ? "HowTo" : seoBrief.schemaType === "Review" ? "ReviewNewsArticle" : "Article";
  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": articleType,
    headline: title,
    description: seoBrief.metaDescription || excerpt,
    image: `${baseUrl}${heroImage}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`,
    },
    author: {
      "@type": "Organization",
      name: "런닝화매니아",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "런닝화매니아",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.ico`,
      },
    },
    keywords: uniqueStrings([seoBrief.primaryKeyword, ...seoBrief.secondaryKeywords]).join(", "),
    mentions: seoBrief.supportingSourceUrls.slice(0, 5).map((url) => ({ "@type": "Thing", sameAs: url })),
  };

  if (articleType === "HowTo" && headings.length > 0) {
    articleSchema.step = headings.map((heading, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: heading,
    }));
  }

  if (faq.length > 0) {
    articleSchema.mainEntity = faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));
  }

  return articleSchema;
}

function buildFallbackSeoBrief(input: {
  title: string;
  contentType: "blog" | "review" | "utility";
  generationMeta: SeoGenerationMetaInput;
  internalLinkCandidates: InternalLinkCandidate[];
}) {
  const primaryKeyword =
    input.generationMeta.primaryKeyword ||
    input.generationMeta.seoKeywords[0] ||
    input.title.trim();
  const searchIntent =
    input.generationMeta.searchIntent === "auto"
      ? inferSearchIntent(input.contentType)
      : input.generationMeta.searchIntent;
  const refinedTitle = improveTitle(input.title, primaryKeyword, searchIntent);
  const mustIncludeSections = uniqueStrings([
    ...getDefaultSections(input.contentType, searchIntent),
    ...input.generationMeta.mustIncludeSections,
  ]);
  const internalLinks = fallbackInternalLinks({
    title: refinedTitle,
    keyword: primaryKeyword,
    candidates: input.internalLinkCandidates,
  });

  return {
    refinedTitle,
    titleCandidates: uniqueStrings([
      refinedTitle,
      `${primaryKeyword} 완벽 가이드`,
      `${primaryKeyword} 핵심 정리`,
    ]).slice(0, 5),
    primaryKeyword,
    secondaryKeywords: uniqueStrings(input.generationMeta.seoKeywords),
    searchIntent,
    serpQuery: primaryKeyword,
    articleAngle: inferArticleAngle(input.contentType, searchIntent),
    serpSummary: "Fallback SEO brief was generated without grounded search results.",
    competitorHighlights: [],
    mustIncludeSections,
    faqQuestions: buildFallbackFaqQuestions(primaryKeyword, searchIntent),
    supportingSourceUrls: uniqueStrings([
      ...input.generationMeta.referenceUrls,
      ...input.generationMeta.competitorUrls,
    ]),
    internalLinks,
    metaTitle: clampMetaTitle(`${refinedTitle} | 런닝화매니아`),
    metaDescription: clampMetaDescription(
      `${primaryKeyword}에 대한 핵심 정보, 선택 기준, 실전 팁을 한 번에 정리한 가이드입니다.`,
    ),
    schemaType: inferSchemaType(input.contentType),
  } satisfies SeoBrief;
}

function buildSeoResearchPrompt(input: {
  title: string;
  contentType: "blog" | "review" | "utility";
  generationMeta: SeoGenerationMetaInput;
  internalLinkCandidates: InternalLinkCandidate[];
}) {
  const { title, contentType, generationMeta, internalLinkCandidates } = input;
  const candidateLines = internalLinkCandidates.slice(0, 12).map(
    (item) => `- slug: ${item.slug} | title: ${item.title} | tags: ${item.tags.join(", ") || "none"}`,
  );

  return `
You are building a premium Korean SEO content brief for a running shoe site.
Use Google Search to understand the live SERP before answering.

User input
- Original title: ${title}
- Content type: ${contentType}
- Template: ${generationMeta.template}
- Target audience: ${generationMeta.targetAudience || "general runners"}
- Tone: ${generationMeta.tone}
- Length: ${generationMeta.length}
- Primary keyword hint: ${generationMeta.primaryKeyword || "none"}
- Secondary keyword hints: ${generationMeta.seoKeywords.join(", ") || "none"}
- Search intent hint: ${generationMeta.searchIntent}
- CTA: ${generationMeta.cta || "none"}
- Competitor URLs supplied by the editor: ${generationMeta.competitorUrls.join(", ") || "none"}
- Fact/reference URLs supplied by the editor: ${generationMeta.referenceUrls.join(", ") || "none"}
- Must-cover sections supplied by the editor: ${generationMeta.mustIncludeSections.join(", ") || "none"}

Available internal link candidates
${candidateLines.length > 0 ? candidateLines.join("\n") : "- none"}

Return JSON only with this schema:
{
  "refinedTitle": "better publish-ready title",
  "titleCandidates": ["candidate 1", "candidate 2", "candidate 3"],
  "primaryKeyword": "main keyword",
  "secondaryKeywords": ["keyword 1", "keyword 2"],
  "searchIntent": "informational|commercial|transactional|comparison|local",
  "serpQuery": "query you effectively researched",
  "articleAngle": "one-sentence editorial angle",
  "serpSummary": "brief summary of what top results are doing and what the article should do better",
  "competitorHighlights": ["insight 1", "insight 2", "insight 3"],
  "mustIncludeSections": ["section 1", "section 2", "section 3"],
  "faqQuestions": ["question 1", "question 2", "question 3"],
  "supportingSourceUrls": ["https://..."],
  "internalLinks": [
    { "slug": "existing-slug", "title": "existing title", "anchor": "anchor text", "reason": "why relevant" }
  ],
  "metaTitle": "SEO title under ~65 chars",
  "metaDescription": "SEO description around 120-160 chars",
  "schemaType": "Article|HowTo|Review"
}

Rules
- Refine the title to improve CTR and intent match, but avoid clickbait and unverifiable claims.
- Recommend only internal links from the provided candidate list.
- Must include at least 3 title candidates.
- Must include at least 3 mustIncludeSections.
- Prefer high-signal, non-generic section ideas and FAQ questions.
- Meta title must include the primary keyword naturally.
- Meta description must be specific and search-intent aligned.
- If the content type is utility, schemaType should usually be HowTo.
- If the content type is review, schemaType should usually be Review.
`;
}

function normalizeSeoBrief(
  parsed: unknown,
  input: {
    title: string;
    contentType: "blog" | "review" | "utility";
    generationMeta: SeoGenerationMetaInput;
    internalLinkCandidates: InternalLinkCandidate[];
  },
  extractedSourceUrls: string[],
) {
  const source = isRecord(parsed) ? parsed : {};
  const primaryKeyword =
    String(source.primaryKeyword || "").trim() ||
    input.generationMeta.primaryKeyword ||
    input.generationMeta.seoKeywords[0] ||
    input.title.trim();
  const searchIntent = normalizeSearchIntent(source.searchIntent, input.contentType);
  const refinedTitle =
    String(source.refinedTitle || "").trim() || improveTitle(input.title, primaryKeyword, searchIntent);
  const secondaryKeywords = uniqueStrings([
    ...normalizeStringArray(source.secondaryKeywords),
    ...input.generationMeta.seoKeywords,
  ]).filter((item) => item !== primaryKeyword);
  const mustIncludeSections = uniqueStrings([
    ...getDefaultSections(input.contentType, searchIntent),
    ...normalizeStringArray(source.mustIncludeSections),
    ...input.generationMeta.mustIncludeSections,
  ]);
  const internalLinks = normalizeInternalLinks(source.internalLinks, input.internalLinkCandidates, refinedTitle, primaryKeyword);
  const sourceUrls = uniqueStrings([
    ...normalizeStringArray(source.supportingSourceUrls),
    ...extractedSourceUrls,
  ]);

  return {
    refinedTitle,
    titleCandidates: uniqueStrings([
      ...normalizeStringArray(source.titleCandidates),
      refinedTitle,
      improveTitle(input.title, primaryKeyword, searchIntent),
    ]).slice(0, 5),
    primaryKeyword,
    secondaryKeywords,
    searchIntent,
    serpQuery: String(source.serpQuery || primaryKeyword).trim(),
    articleAngle: String(source.articleAngle || inferArticleAngle(input.contentType, searchIntent)).trim(),
    serpSummary: String(source.serpSummary || "").trim() || "Grounded SERP analysis completed.",
    competitorHighlights: uniqueStrings(normalizeStringArray(source.competitorHighlights)).slice(0, 6),
    mustIncludeSections,
    faqQuestions: uniqueStrings([
      ...normalizeStringArray(source.faqQuestions),
      ...buildFallbackFaqQuestions(primaryKeyword, searchIntent),
    ]).slice(0, 6),
    supportingSourceUrls: sourceUrls,
    internalLinks,
    metaTitle: clampMetaTitle(
      String(source.metaTitle || "").trim() || `${refinedTitle} | 런닝화매니아`,
    ),
    metaDescription: clampMetaDescription(
      String(source.metaDescription || "").trim() ||
        `${primaryKeyword}에 대한 핵심 정보와 선택 기준, 실전 팁을 정리한 고급 가이드입니다.`,
    ),
    schemaType: normalizeSchemaType(source.schemaType, input.contentType),
  } satisfies SeoBrief;
}

function normalizeInternalLinks(
  value: unknown,
  candidates: InternalLinkCandidate[],
  title: string,
  keyword: string,
) {
  const candidateMap = new Map(candidates.map((item) => [item.slug, item]));
  const parsed = Array.isArray(value)
    ? value
        .map((item) => {
          if (!isRecord(item)) return null;
          const slug = String(item.slug || "").trim();
          if (!slug || !candidateMap.has(slug)) return null;
          const candidate = candidateMap.get(slug)!;
          return {
            slug,
            title: candidate.title,
            anchor: String(item.anchor || candidate.title).trim() || candidate.title,
            reason: String(item.reason || "").trim() || "Relevant supporting internal article.",
          } satisfies InternalLinkSuggestion;
        })
        .filter((item): item is InternalLinkSuggestion => item !== null)
    : [];

  if (parsed.length > 0) {
    return parsed.slice(0, 5);
  }

  return fallbackInternalLinks({ title, keyword, candidates });
}

function fallbackInternalLinks(input: {
  title: string;
  keyword: string;
  candidates: InternalLinkCandidate[];
}) {
  const queryTokens = tokenize(`${input.title} ${input.keyword}`);
  return [...input.candidates]
    .map((candidate) => ({
      candidate,
      score: overlapScore(queryTokens, tokenize(`${candidate.title} ${candidate.excerpt} ${candidate.tags.join(" ")}`)),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map(({ candidate }) => ({
      slug: candidate.slug,
      title: candidate.title,
      anchor: candidate.title,
      reason: "Matches the article topic and supports internal topical authority.",
    }));
}

function extractInteractionText(outputs: unknown) {
  if (!Array.isArray(outputs)) return "";
  return outputs
    .map((output) => {
      if (!isRecord(output) || output.type !== "text") return "";
      return String(output.text || "");
    })
    .filter(Boolean)
    .join("\n");
}

function extractAnnotationSources(outputs: unknown) {
  if (!Array.isArray(outputs)) return [];
  const sources: string[] = [];
  for (const output of outputs) {
    if (!isRecord(output) || output.type !== "text" || !Array.isArray(output.annotations)) continue;
    for (const annotation of output.annotations) {
      if (!isRecord(annotation)) continue;
      const source = String(annotation.source || "").trim();
      if (source) sources.push(source);
    }
  }
  return sources;
}

function extractSearchResultUrls(outputs: unknown) {
  if (!Array.isArray(outputs)) return [];
  const urls: string[] = [];
  for (const output of outputs) {
    if (!isRecord(output) || output.type !== "google_search_result" || !Array.isArray(output.result)) continue;
    for (const result of output.result) {
      if (!isRecord(result)) continue;
      const url = String(result.url || "").trim();
      if (url) urls.push(url);
    }
  }
  return urls;
}

function parseJsonBlock(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;
  return JSON.parse(withoutFence);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

function normalizeSearchIntent(value: unknown, contentType: "blog" | "review" | "utility") {
  const candidate = String(value || "").trim().toLowerCase() as SearchIntent;
  if (candidate === "informational" || candidate === "commercial" || candidate === "transactional" || candidate === "comparison" || candidate === "local") {
    return candidate;
  }
  return inferSearchIntent(contentType);
}

function normalizeSchemaType(value: unknown, contentType: "blog" | "review" | "utility") {
  const candidate = String(value || "").trim();
  if (candidate === "HowTo" || candidate === "Review" || candidate === "Article") {
    return candidate;
  }
  return inferSchemaType(contentType);
}

function inferSearchIntent(contentType: "blog" | "review" | "utility") {
  if (contentType === "review") return "commercial";
  if (contentType === "utility") return "informational";
  return "informational";
}

function inferSchemaType(contentType: "blog" | "review" | "utility") {
  if (contentType === "utility") return "HowTo";
  if (contentType === "review") return "Review";
  return "Article";
}

function inferArticleAngle(
  contentType: "blog" | "review" | "utility",
  searchIntent: Exclude<SearchIntent, "auto">,
) {
  if (contentType === "review") {
    return "Help readers decide whether the product fits their running style and needs.";
  }
  if (contentType === "utility") {
    return "Solve the user's problem quickly with steps, formulas, examples, and pitfalls.";
  }
  if (searchIntent === "commercial" || searchIntent === "comparison") {
    return "Blend expert guidance with decision criteria so the reader can choose confidently.";
  }
  return "Provide the clearest, most practical answer to the query with expert-level context.";
}

function getDefaultSections(
  contentType: "blog" | "review" | "utility",
  searchIntent: Exclude<SearchIntent, "auto">,
) {
  if (contentType === "review") {
    return ["핵심 결론", "착화감과 핏", "장단점", "이런 러너에게 추천"];
  }
  if (contentType === "utility") {
    return ["핵심 요약", "사용 방법", "실수하기 쉬운 부분", "실전 예시"];
  }
  if (searchIntent === "commercial" || searchIntent === "comparison") {
    return ["핵심 결론", "선택 기준", "비교 포인트", "추천 대상"];
  }
  return ["핵심 요약", "선택 기준", "실수하기 쉬운 부분", "추천 대상"];
}

function buildFallbackFaqQuestions(
  keyword: string,
  searchIntent: Exclude<SearchIntent, "auto">,
) {
  const intentSuffix =
    searchIntent === "commercial" || searchIntent === "comparison"
      ? "선택 기준은 무엇인가요?"
      : "어떻게 활용하면 좋나요?";
  return [
    `${keyword}에서 가장 중요한 체크포인트는 무엇인가요?`,
    `${keyword}를 고를 때 초보자가 자주 하는 실수는 무엇인가요?`,
    `${keyword}는 어떤 사람에게 특히 잘 맞나요?`,
    `${keyword}는 실제로 ${intentSuffix}`,
  ];
}

function improveTitle(title: string, keyword: string, searchIntent: Exclude<SearchIntent, "auto">) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return keyword;

  if (normalizeForMatch(trimmedTitle).includes(normalizeForMatch(keyword))) {
    if (searchIntent === "commercial" || searchIntent === "comparison") {
      return trimmedTitle.includes(":") ? trimmedTitle : `${trimmedTitle}: 선택 기준과 추천 포인트`;
    }
    return trimmedTitle.includes(":") ? trimmedTitle : `${trimmedTitle}: 핵심 기준과 실전 팁`;
  }

  return `${keyword} ${searchIntent === "commercial" ? "선택 가이드" : "완벽 가이드"}: ${trimmedTitle}`;
}

function clampMetaTitle(value: string) {
  const trimmed = value.trim();
  return trimmed.length <= 65 ? trimmed : `${trimmed.slice(0, 62).trim()}...`;
}

function clampMetaDescription(value: string) {
  const trimmed = value.trim();
  if (trimmed.length >= 90 && trimmed.length <= 170) return trimmed;
  if (trimmed.length > 170) return `${trimmed.slice(0, 167).trim()}...`;
  return trimmed;
}

function tokenize(value: string) {
  return normalizeForMatch(value)
    .split(/\s+/)
    .filter((item) => item.length >= 2);
}

function overlapScore(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.reduce((count, token) => count + (rightSet.has(token) ? 1 : 0), 0);
}

function hasKeywordCoverage(text: string, keyword: string) {
  const keywordTokens = tokenize(keyword);
  if (keywordTokens.length === 0) return true;

  const textTokens = new Set(tokenize(text));
  const matchedTokenCount = keywordTokens.filter((token) => textTokens.has(token)).length;
  return matchedTokenCount / keywordTokens.length >= 0.67;
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, " ").replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSeoClient(apiKey: string) {
  if (!seoClient) {
    seoClient = new GoogleGenAI({ apiKey });
  }
  return seoClient;
}
