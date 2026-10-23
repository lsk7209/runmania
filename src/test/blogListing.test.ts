import { describe, expect, it } from "vitest";
import {
  BLOG_PAGE_SIZE,
  classifyPost,
  countByCategory,
  filterPosts,
  paginate,
  parseListingState,
  toListingParams,
  type ListablePost,
} from "@/lib/blogListing";

const make = (n: number): ListablePost[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `post-${i}`,
    title: i % 3 === 0 ? `무릎 통증 러닝화 ${i}` : i % 3 === 1 ? `호카 vs 아식스 ${i}` : `러닝 팁 ${i}`,
    excerpt: "요약",
    tags: [],
  }));

describe("블로그 목록", () => {
  it("모든 글이 정확히 하나의 분류에 속하고 분류 합계가 전체와 같다", () => {
    const posts = make(100);
    const c = countByCategory(posts, "");
    expect(c.all).toBe(100);
    expect(c.pain + c.body + c.compare + c.tips).toBe(100);
    expect(posts.every((p) => classifyPost(p))).toBe(true);
  });

  it("검색은 전체 글에 적용한 뒤 페이지를 나눈다", () => {
    const posts = make(100);
    const last = posts[98]; // 뒤쪽 페이지에 있는 글
    const found = filterPosts(posts, "러닝 팁 98", "all");
    expect(found).toEqual([last]);
    expect(paginate(found, 1).totalPages).toBe(1);
  });

  it("검색어가 바뀌어 페이지 수가 줄어도 범위를 벗어난 페이지는 마지막 페이지로 보정된다", () => {
    const filtered = filterPosts(make(100), "무릎", "all");
    const result = paginate(filtered, 99);
    expect(result.page).toBe(result.totalPages);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("페이지를 모두 이으면 중복·누락 없이 전체 글과 같다", () => {
    const posts = make(100);
    const { totalPages } = paginate(posts, 1);
    const slugs = Array.from({ length: totalPages }, (_, i) => paginate(posts, i + 1).items).flat().map((p) => p.slug);
    expect(slugs).toEqual(posts.map((p) => p.slug));
    expect(paginate(posts, 1).items).toHaveLength(BLOG_PAGE_SIZE);
  });

  it("검색 결과가 없으면 빈 배열과 1페이지를 돌려준다", () => {
    const r = paginate(filterPosts(make(10), "존재하지않는검색어", "all"), 3);
    expect(r).toEqual({ items: [], page: 1, totalPages: 1 });
  });

  it("URL 상태를 왕복해도 같은 상태를 복원한다", () => {
    const state = { query: "카야노", category: "compare" as const, page: 3 };
    expect(parseListingState(toListingParams(state))).toEqual(state);
    expect(toListingParams({ query: "", category: "all", page: 1 }).toString()).toBe("");
    expect(parseListingState(new URLSearchParams("page=-4&cat=zzz"))).toEqual({
      query: "",
      category: "all",
      page: 1,
    });
  });
});
