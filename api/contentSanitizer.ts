/**
 * @file contentSanitizer.ts
 * AI 생성 본문의 깨진 마크업·링크를 응답 직전에 정리한다 (DB 원본은 그대로).
 * - 블록 마커([TIP] 등)가 문단 중간에 있거나 닫는 태그가 없으면 렌더러가 원문을 노출한다
 * - 내부 링크가 /blog/ 누락, 가짜 도메인, 템플릿 변수 등으로 404가 된다
 */

const BLOCK_TAGS =
  "TABLE|HIGHLIGHT|CHECKLIST|QUOTE|INFO|WARNING|TIP|COMPARISON";
const OPEN_TAG = new RegExp(`(\\*\\*)?\\[(${BLOCK_TAGS})\\]`);
const ANY_TAG = new RegExp(`\\[\\/?(${BLOCK_TAGS})\\]`, "g");
const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
/** 블로그 글이 아닌 사이트 경로 (도구·리뷰·신뢰 페이지) */
const STATIC_PREFIX =
  /^\/(tools|reviews)\/[^/]+\/?$|^\/(tools|reviews|about|contact|privacy|terms|blog)?\/?$/;
/** 본문 생성 시 잘못 들어간 자리표시·만료 링크 호스트 → 링크 제거 */
const DEAD_HOSTS = new Set([
  "example.com",
  "vertexaisearch.cloud.google.com",
  "runnersguide.kr",
  "runners-site.com",
]);
const SLUG_PREFIX = /^(@?\/)?(_blog\/|_internal_link\/|blog\/)?(slug:)?/;

/** 깨진 블록 마커를 렌더러가 인식하는 `[TAG]…[/TAG]` 문단으로 정리한다 */
export function normalizeBlockMarkers(content: string[]): string[] {
  return content.flatMap(normalizeParagraph);
}

function normalizeParagraph(paragraph: string): string[] {
  const match = OPEN_TAG.exec(paragraph);
  if (!match) return [paragraph];

  const [marker, bold, tag] = match;
  const before = paragraph.slice(0, match.index).trim();
  // 블록 안에 반복·중첩된 마커는 모두 제거 (닫는 태그는 끝에 하나만 둔다)
  const rest = paragraph
    .slice(match.index + marker.length)
    .replace(ANY_TAG, "");
  const body = `${bold ?? ""}${rest}`.trim();
  if (!body) return before ? [before] : [];

  const block = `[${tag}]${body}[/${tag}]`;
  return before ? [before, block] : [block];
}

/** 마크다운 링크를 실제 경로로 고치고, 고칠 수 없으면 링크 텍스트만 남긴다 */
export function sanitizeLinks(
  text: string,
  slugExists: (slug: string) => boolean,
): string {
  return text.replace(MARKDOWN_LINK, (whole, label: string, href: string) => {
    const resolved = resolveHref(href, slugExists);
    if (resolved === null) return label;
    return resolved === href ? whole : `[${label}](${resolved})`;
  });
}

function resolveHref(
  href: string,
  slugExists: (slug: string) => boolean,
): string | null {
  if (href.includes("${")) return null;

  if (/^https?:\/\//.test(href)) {
    const url = safeUrl(href);
    if (!url) return null;
    const slug = toSlug(url.pathname);
    if (slug && slugExists(slug)) return `/blog/${slug}`;
    return DEAD_HOSTS.has(url.hostname.replace(/^www\./, "")) ? null : href;
  }

  const path = href.split("#")[0];
  if (STATIC_PREFIX.test(path)) return href;
  const slug = toSlug(path);
  return slug && slugExists(slug) ? `/blog/${slug}` : null;
}

function toSlug(path: string): string {
  const raw = path.replace(SLUG_PREFIX, "").replace(/\/$/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function safeUrl(href: string): URL | null {
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

/** 본문 배열 전체 정리: 마커 → 링크 순 */
export function sanitizeContent(
  content: string[],
  slugExists: (slug: string) => boolean,
): string[] {
  return normalizeBlockMarkers(content).map((p) =>
    sanitizeLinks(p, slugExists),
  );
}
