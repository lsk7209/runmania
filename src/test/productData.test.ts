import { describe, expect, it } from "vitest";
import { SHOES_DB } from "../data/shoesDb";
import { reviewData } from "../data/reviewContent";
import { VERIFIED_FACTS } from "../data/productFacts";

describe("제품 데이터 검수", () => {
  it("필수 항목과 값 범위가 유효하다", () => {
    for (const s of SHOES_DB) {
      expect(s.name.trim(), s.name).not.toBe("");
      expect(s.widthAvailable, s.name).toContain("표준");
      expect(s.weightGrams, s.name).toBeGreaterThan(100);
      expect(s.weightGrams, s.name).toBeLessThan(500);
      expect(s.dropMm, s.name).toBeGreaterThanOrEqual(0);
      expect(s.dropMm, s.name).toBeLessThanOrEqual(14);
      expect(s.priceRange, s.name).toMatch(/\d/);
      expect(s.cushionLevel).toBeGreaterThanOrEqual(1);
      expect(s.cushionLevel).toBeLessThanOrEqual(5);
    }
  });

  it("제품 이름이 중복되지 않는다", () => {
    expect(new Set(SHOES_DB.map((s) => s.name)).size).toBe(SHOES_DB.length);
  });

  it("출처가 있는 사실은 존재하는 제품에 연결되고 확인일·링크가 있다", () => {
    const names = new Set(SHOES_DB.map((s) => s.name));
    for (const [name, facts] of Object.entries(VERIFIED_FACTS)) {
      expect(names.has(name), name).toBe(true);
      for (const f of facts) {
        expect(f.url).toMatch(/^https:\/\//);
        expect(f.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("출처 확인된 1080 v13 드롭이 제품 데이터와 일치한다", () => {
    const shoe = SHOES_DB.find((s) => s.name.includes("1080 v13"));
    expect(shoe?.dropMm).toBe(6);
  });

  it("리뷰 평점은 1~5 범위이고 연결된 리뷰의 FAQ 형식이 유효하다", () => {
    for (const s of SHOES_DB) {
      const r = reviewData[s.name];
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
      for (const f of r.faq) {
        expect(f.q).toBeTruthy();
        expect(f.a).toBeTruthy();
      }
    }
  });
});
