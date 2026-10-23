import { describe, expect, it } from "vitest";
import { SHOES_DB } from "../data/shoesDb";
import { reviewData } from "../data/reviewContent";
import { REVIEW_SLUGS, findShoeBySlug, shoeSlug } from "../data/reviewSlug";
import { REVIEW_SLUGS as SITEMAP_SLUGS } from "../../api/sitemap";
import { buildReviewJsonLd } from "../lib/reviewSeo";

describe("리뷰 URL", () => {
  it("사이트맵 슬러그가 공개 리뷰 전체와 일치한다", () => {
    expect([...SITEMAP_SLUGS].sort()).toEqual([...REVIEW_SLUGS].sort());
  });

  it("모든 슬러그가 유일하고 해당 제품으로 되돌아온다", () => {
    expect(new Set(REVIEW_SLUGS).size).toBe(SHOES_DB.length);
    for (const shoe of SHOES_DB) {
      expect(findShoeBySlug(shoeSlug(shoe.name))).toBe(shoe);
    }
  });

  it("없는 슬러그는 제품을 찾지 못한다", () => {
    expect(findShoeBySlug("없는-신발-1")).toBeUndefined();
  });

  it("모든 제품에 리뷰 콘텐츠가 연결돼 있다", () => {
    for (const shoe of SHOES_DB) expect(reviewData[shoe.name]).toBeDefined();
  });
});

describe("리뷰 구조화데이터", () => {
  it("가격 범위를 숫자로 뭉개거나 근거 없는 Offer를 만들지 않는다", () => {
    for (const shoe of SHOES_DB) {
      const ld = buildReviewJsonLd(shoe, reviewData[shoe.name], undefined);
      expect(ld).not.toHaveProperty("offers");
      expect(JSON.stringify(ld)).not.toContain("InStock");
    }
  });
});
