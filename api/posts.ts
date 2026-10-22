import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tursoClient } from "./db.js";
import {
  getRedirectTarget,
  isIndexablePost,
  isNoindexPost,
} from "./indexPolicy.js";
import { sanitizeContent, sanitizeLinks } from "./contentSanitizer.js";
import { isHealthTopic } from "./healthTopic.js";
import { softenMetaValue } from "./metaText.js";

type PostRow = Record<string, unknown>;

/** 단건 공개 응답 컬럼 (워크플로·AI 생성 관리 필드는 제외) */
const DETAIL_COLUMNS =
  "slug, title, excerpt, content, tags, read_time, hero_image, related_slugs, faq, generation_meta, published_at, created_at, updated_at";
const SLUG_CACHE_MS = 5 * 60 * 1000;
let slugCache: { slugs: Set<string>; loadedAt: number } | null = null;

/** 링크 검증용 발행 글 슬러그 목록 (인스턴스 내 캐시) */
async function loadPublishedSlugs(): Promise<Set<string>> {
  if (slugCache && Date.now() - slugCache.loadedAt < SLUG_CACHE_MS) {
    return slugCache.slugs;
  }
  const result = await tursoClient.execute(`
    SELECT slug FROM blog_posts
    WHERE status = 'published' AND workflow_status = 'approved'
  `);
  const slugs = new Set(result.rows.map((row) => String(row.slug)));
  slugCache = { slugs, loadedAt: Date.now() };
  return slugs;
}

type FaqItem = {
  question: string;
  answer: string;
};

/** 발행 글은 자주 바뀌지 않으므로 CDN 캐시 (TTFB·DB 조회 감소). 예약 발행 반영은 최대 5분 지연 */
function setPublicCache(res: VercelResponse) {
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const slug =
      typeof req.query.slug === "string" ? req.query.slug : undefined;

    if (slug) {
      const result = await tursoClient.execute({
        sql: `
          SELECT ${DETAIL_COLUMNS}
          FROM blog_posts
          WHERE status = 'published'
            AND workflow_status = 'approved'
            AND slug = ?
          LIMIT 1
        `,
        args: [slug],
      });

      const row = result.rows[0];
      if (!row) {
        return res.status(404).json({ error: "Post not found" });
      }

      const slugs = await loadPublishedSlugs();
      const resolveSlug = (candidate: string) =>
        slugs.has(candidate)
          ? (getRedirectTarget(candidate) ?? candidate)
          : null;
      const post = parsePostRow(row);

      setPublicCache(res);
      return res.status(200).json({
        ...post,
        content: sanitizeContent(post.content, resolveSlug),
        faq: post.faq.map((item) => ({
          ...item,
          answer: sanitizeLinks(item.answer, resolveSlug),
        })),
        noindex: isNoindexPost(row.slug),
        redirect_to: getRedirectTarget(row.slug),
        health_topic: isHealthTopic(row.title),
      });
    }

    const result = await tursoClient.execute(`
      SELECT slug, title, excerpt, tags, read_time, hero_image, related_slugs, published_at, updated_at
      FROM blog_posts
      WHERE status = 'published'
        AND workflow_status = 'approved'
      ORDER BY published_at DESC
    `);

    // 검색 제외·리다이렉트 글은 목록에서 숨긴다 (URL 직접 접근은 유지)
    setPublicCache(res);
    return res
      .status(200)
      .json(
        result.rows
          .filter((row) => isIndexablePost(row.slug))
          .map(parsePostRow),
      );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
}

/** 공개 응답에 포함할 컬럼 (SQL 변경과 무관하게 내부 필드가 새지 않도록 코드에서도 고정) */
const PUBLIC_FIELDS = [
  "slug",
  "read_time",
  "hero_image",
  "published_at",
  "created_at",
  "updated_at",
] as const;

function parsePostRow(row: PostRow) {
  const base = Object.fromEntries(
    PUBLIC_FIELDS.filter((key) => key in row).map((key) => [key, row[key]]),
  );
  return {
    ...base,
    title: softenMetaValue(row.title),
    excerpt: softenMetaValue(row.excerpt),
    content: parseStringArray(row.content),
    tags: parseStringArray(row.tags),
    related_slugs: parseStringArray(row.related_slugs),
    faq: parseFaqArray(row.faq),
    generation_meta: pickPublicSeoMeta(tryParseJson(row.generation_meta)),
  };
}

/** 생성 메타 중 화면에 필요한 SEO 필드만 공개 (프롬프트·키워드 등 내부 정보 제외) */
function pickPublicSeoMeta(meta: unknown) {
  if (typeof meta !== "object" || meta === null) return undefined;
  const { metaTitle, metaDescription, schemaJson } = meta as Record<
    string,
    unknown
  >;
  return {
    metaTitle: softenMetaValue(metaTitle),
    metaDescription: softenMetaValue(metaDescription),
    schemaJson,
  };
}

function parseStringArray(value: unknown) {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

function parseFaqArray(value: unknown): FaqItem[] {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const question = String((item as FaqItem).question ?? "").trim();
      const answer = String((item as FaqItem).answer ?? "").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is FaqItem => item !== null);
}

function tryParseJson(value: unknown) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}
