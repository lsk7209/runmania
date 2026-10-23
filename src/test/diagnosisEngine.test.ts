import { describe, expect, it } from "vitest";
import { diagnose, type UserAnswers } from "@/lib/diagnosisEngine";
import { SHOES_DB } from "@/data/shoesDb";
import { parseFootMeasurement } from "@/lib/footMeasurement";

const BASE: UserAnswers = {
  q1Brand: "other",
  q3Arch: "normal",
  q4Weight: "normal",
  q5Level: "intermediate",
  q6Pain: "none",
  q7Cushion: "balanced",
};
const shown = (r: ReturnType<typeof diagnose>) => [r.recommended, ...r.alternatives];

describe("진단 입력과 폭 판단", () => {
  it("측정값·착용 경험이 없어도 결과가 나오고 폭 미판단이 안내된다", () => {
    const r = diagnose({ ...BASE, q1Brand: "first" });
    expect(r.recommended).toBeDefined();
    expect(r.missingInfo.join(" ")).toContain("폭은 판단하지 않았습니다");
    expect(r.footProfile.width).toContain("정보 부족");
  });

  it("첫 구매·기타 브랜드는 브랜드 일반론으로 폭을 추정하지 않는다", () => {
    const base = diagnose(BASE);
    for (const q1Brand of ["first", "other", "unknown", "nike"]) {
      const r = diagnose({ ...BASE, q1Brand });
      expect(r.recommended.name).toBe(base.recommended.name);
      expect(r.tags).toEqual(base.tags);
    }
  });

  it("앞볼 압박 경험이 있어도 와이드 옵션이 있는 모델은 제외하지 않는다", () => {
    const r = diagnose({ ...BASE, q2Fit: "forefoot-tight" });
    const cautionNames = r.caution.map((s) => s.name);
    for (const shoe of SHOES_DB) {
      const hasWide = shoe.widthAvailable.some((w) => w !== "표준");
      if (hasWide) expect(cautionNames).not.toContain(shoe.name);
    }
    // 표준 폭만 있는 모델은 우선순위가 낮아진다
    expect(shown(r).every((s) => s.widthAvailable.some((w) => w !== "표준"))).toBe(true);
  });

  it("와이드 옵션 모델의 추천에는 판매 여부 확인 안내가 붙는다", () => {
    const r = diagnose({ ...BASE, q2Fit: "forefoot-tight" });
    expect(r.notes[r.recommended.name].join(" ")).toContain("국내 판매 여부는 확인되지 않았습니다");
    expect(r.reasons[r.recommended.name].length).toBeGreaterThan(0);
  });

  it("같은 폭이라도 길이에 따라 참고 비율이 달라지고 추천은 바뀌지 않는다", () => {
    const a = diagnose({ ...BASE, footLengthMm: 240, footWidthMm: 100 });
    const b = diagnose({ ...BASE, footLengthMm: 280, footWidthMm: 100 });
    expect(a.missingInfo.join(" ")).toContain("0.42");
    expect(b.missingInfo.join(" ")).toContain("0.36");
    expect(a.recommended.name).toBe(b.recommended.name);
  });

  it("잘못된 단위·범위 밖 치수는 반영하지 않고 안내한다", () => {
    expect(parseFootMeasurement(25, 10).rejected).toEqual(["length", "width"]);
    expect(parseFootMeasurement(260, 270).rejected).toEqual(["width"]);
    expect(parseFootMeasurement(260, 100).rejected).toEqual([]);
    expect(parseFootMeasurement(undefined, undefined).rejected).toEqual([]);
    const r = diagnose({ ...BASE, footLengthMm: 25, footWidthMm: 10 });
    expect(r.missingInfo.join(" ")).toContain("입력 범위를 벗어난");
  });

  it("조건과 맞는 가산 요소가 없으면 낮은 확신도로 표시된다", () => {
    expect(diagnose({ ...BASE, q5Level: "none" }).lowConfidence).toBe(true);
  });

  it("통증 입력 시 진단이 아님을 안내하고 금지 표현을 쓰지 않는다", () => {
    const r = diagnose({ ...BASE, q6Pain: "sole" });
    expect(r.missingInfo.join(" ")).toContain("의료진 상담");
    const text = JSON.stringify(r);
    expect(text).not.toMatch(/착용 금지|처방|교정 필요/);
  });
});
