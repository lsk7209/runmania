/**
 * 블로그 목록의 분류·검색·페이지 나누기 규칙 (순수 함수).
 * 검색과 분류는 전체 글에 먼저 적용하고, 그 결과를 페이지로 나눈다.
 */
export type CategoryKey = "all" | "pain" | "body" | "compare" | "tips";

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pain", label: "통증/부상" },
  { key: "body", label: "발유형/체형" },
  { key: "compare", label: "브랜드 비교" },
  { key: "tips", label: "러닝 실전" },
];

export const BLOG_PAGE_SIZE = 24;

export interface ListablePost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
}

/** 위에서부터 먼저 맞는 분류가 적용된다. 어디에도 맞지 않으면 '러닝 실전'. */
const CATEGORY_RULES: { key: Exclude<CategoryKey, "all" | "tips">; pattern: RegExp }[] = [
  { key: "compare", pattern: /\bvs\b|비교|브랜드/i },
  { key: "pain", pattern: /통증|부상|족저|신\s?스플린트|정강이|아킬레스|무릎|엉덩이|고관절|발목|물집|티눈|재활/ },
  { key: "body", pattern: /평발|편평|요족|하이\s?아치|아치|발볼|와이드|과체중|체중|여성|오버프로네이션|프로네이션|서피네이션|내전|외전/ },
];

export function classifyPost(post: ListablePost): Exclude<CategoryKey, "all"> {
  const haystack = `${post.title} ${post.tags.join(" ")}`;
  return CATEGORY_RULES.find((r) => r.pattern.test(haystack))?.key ?? "tips";
}

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "");

export function matchesQuery(post: ListablePost, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return normalize(`${post.title} ${post.excerpt} ${post.tags.join(" ")}`).includes(q);
}

export function countByCategory(posts: ListablePost[], query: string) {
  const counts: Record<CategoryKey, number> = { all: 0, pain: 0, body: 0, compare: 0, tips: 0 };
  for (const post of posts) {
    if (!matchesQuery(post, query)) continue;
    counts.all += 1;
    counts[classifyPost(post)] += 1;
  }
  return counts;
}

export function filterPosts<T extends ListablePost>(
  posts: T[],
  query: string,
  category: CategoryKey,
): T[] {
  return posts.filter(
    (p) => matchesQuery(p, query) && (category === "all" || classifyPost(p) === category),
  );
}

export function paginate<T>(items: T[], page: number, pageSize = BLOG_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, totalPages };
}

export interface ListingState {
  query: string;
  category: CategoryKey;
  page: number;
}

export function parseListingState(params: URLSearchParams): ListingState {
  const cat = params.get("cat");
  const category = CATEGORIES.some((c) => c.key === cat) ? (cat as CategoryKey) : "all";
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    query: (params.get("q") ?? "").trim().slice(0, 60),
    category,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toListingParams({ query, category, page }: ListingState): URLSearchParams {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category !== "all") params.set("cat", category);
  if (page > 1) params.set("page", String(page));
  return params;
}
