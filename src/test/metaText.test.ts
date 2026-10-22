import { describe, expect, it } from "vitest";
import { softenMetaText } from "../../api/metaText";

describe("softenMetaText", () => {
  it("자리표시 [사이트명]을 사이트 이름으로 바꾼다", () => {
    expect(softenMetaText("뒤꿈치 물집 가이드 | [사이트명]")).toBe(
      "뒤꿈치 물집 가이드 | 런닝화매니아",
    );
  });

  it("근거 없는 전문가 권위 표현을 완화한다", () => {
    expect(softenMetaText("전문가의 시선으로 심층 비교 분석합니다.")).toBe(
      "심층 비교 분석합니다.",
    );
    expect(softenMetaText("종아리 당김 전문가 가이드")).toBe(
      "종아리 당김 가이드",
    );
    expect(softenMetaText("전문가가 알려드립니다")).toBe("알려드립니다");
    expect(softenMetaText("전문가처럼 완벽한 러닝화를 선택")).toBe(
      "완벽한 러닝화를 선택",
    );
  });

  it("단어를 남겨 문장이 끊기지 않게 한다", () => {
    expect(softenMetaText("선택하는 전문가적 방법을 제시합니다.")).toBe(
      "선택하는 방법을 제시합니다.",
    );
    expect(softenMetaText("전문가의 실질적인 조언을 제공합니다.")).toBe(
      "실용적인 조언을 제공합니다.",
    );
  });

  it("권고 문장(전문의 상담)과 일반 문장은 건드리지 않는다", () => {
    const text = "통증이 지속되면 정형외과 전문의와 상담하세요.";
    expect(softenMetaText(text)).toBe(text);
  });
});
