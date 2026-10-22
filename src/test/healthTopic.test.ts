import { describe, expect, it } from "vitest";
import { isHealthTopic } from "../../api/healthTopic";

describe("isHealthTopic", () => {
  it("통증·부상 주제 제목을 판별한다", () => {
    expect(isHealthTopic("내리막 러닝 무릎 통증 줄이는 신발 기준")).toBe(true);
    expect(isHealthTopic("족저근막염 러닝화 뒤꿈치 지지력 기준")).toBe(true);
  });

  it("일반 주제와 잘못된 값은 제외한다", () => {
    expect(isHealthTopic("비 오는 날 러닝화 고르는 법")).toBe(false);
    expect(isHealthTopic(undefined)).toBe(false);
  });
});
