import { describe, expect, it } from "vitest";
import { diagnose, type UserAnswers } from "@/lib/diagnosisEngine";
import { SHOES_DB } from "@/data/shoesDb";
import {
  BONUS_RULES,
  EXCLUDE_RULES,
  SURVEY_QUESTIONS,
  TYPE_PRIORITY,
} from "@/data/methodology";

const BASE: UserAnswers = {
  q1Brand: "other",
  q2Fit: "fine",
  q3Arch: "normal",
  q4Weight: "normal",
  q5Level: "intermediate",
  q6Pain: "none",
  q7Cushion: "balanced",
};
const typeOf = (over: Partial<UserAnswers>) =>
  diagnose({ ...BASE, ...over }).typeName;

describe("진단 방법 페이지는 엔진의 실제 동작과 일치한다", () => {
  it("설문은 7문항이다", () => {
    expect(SURVEY_QUESTIONS).toHaveLength(7);
  });

  it("제외 규칙: 해당 태그가 있는 신발은 추천·대안에 나오지 않는다", () => {
    const cases = [
      { over: { q2Fit: "forefoot-tight" as const }, tag: "wide-foot" },
      { over: { q3Arch: "flat" }, tag: "flat-foot" },
      { over: { q3Arch: "high" }, tag: "high-arch" },
      { over: { q5Level: "beginner" }, tag: "beginner" },
    ];
    for (const { over, tag } of cases) {
      expect(EXCLUDE_RULES.some((r) => r.tag === tag)).toBe(true);
      const result = diagnose({ ...BASE, ...over });
      const shown = [result.recommended, ...result.alternatives];
      expect(shown.every((s) => !s.banFor.includes(tag))).toBe(true);
    }
  });

  it("-100점 규칙의 신발은 우선순위를 낮춘 목록에 들어간다 (와이드 옵션 모델은 제외)", () => {
    const wide = diagnose({ ...BASE, q2Fit: "forefoot-tight" });
    const expected = SHOES_DB.filter(
      (s) =>
        s.banFor.includes("wide-foot") &&
        s.widthAvailable.every((w) => w === "표준"),
    );
    expect(wide.caution.map((s) => s.name).sort()).toEqual(
      expected.map((s) => s.name).sort(),
    );
  });

  it("유형 우선순위가 표와 같다", () => {
    expect(
      typeOf({ q2Fit: "forefoot-tight", q7Cushion: "soft", q3Arch: "flat" }),
    ).toContain("TYPE A");
    expect(typeOf({ q3Arch: "flat", q4Weight: "heavy" })).toContain("TYPE B");
    expect(typeOf({ q6Pain: "ankle" })).toContain("TYPE B");
    expect(typeOf({ q4Weight: "heavy" })).toContain("TYPE C");
    expect(typeOf({ q6Pain: "knee" })).toContain("TYPE C");
    expect(typeOf({ q5Level: "advanced" })).toContain("TYPE D");
    expect(typeOf({ q2Fit: "forefoot-tight" })).toContain("TYPE E");
    expect(typeOf({})).toContain("TYPE F");
    expect(TYPE_PRIORITY.map((t) => t.name.slice(0, 6))).toEqual([
      "TYPE A",
      "TYPE B",
      "TYPE C",
      "TYPE D",
      "TYPE E",
      "TYPE F",
    ]);
  });

  it("가산 점수 표는 엔진 소스의 가중치와 같다", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/lib/diagnosisEngine.ts", "utf8");
    const engineWeights = [...source.matchAll(/score \+= (\d+)/g)].map((m) =>
      Number(m[1]),
    );
    const docWeights = BONUS_RULES.map((r) => r.points);
    expect([...docWeights].sort((a, b) => a - b)).toEqual(
      [...engineWeights].sort((a, b) => a - b),
    );
  });
});
