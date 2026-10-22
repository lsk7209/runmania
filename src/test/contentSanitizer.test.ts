// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  normalizeBlockMarkers,
  sanitizeLinks,
} from "../../api/contentSanitizer";

const SLUGS = new Set([
  "레이스홀-묶기-실수-물집-교환-깔창-확인",
  "요족-러닝화-기준-쿠션만-보면-안-되는-이유",
  "running-in-rain-shoe-guide",
]);
const REDIRECTS: Record<string, string> = {
  "break-in-running-shoes": "running-shoe-break-in-guide",
};
const exists = (slug: string) =>
  SLUGS.has(slug) || slug in REDIRECTS ? (REDIRECTS[slug] ?? slug) : null;

describe("normalizeBlockMarkers (실제 발행 글의 깨진 패턴)", () => {
  it("닫는 태그가 없으면 문단 끝에 붙인다", () => {
    expect(normalizeBlockMarkers(["[TABLE]문제점|설명\n부상|통증"])).toEqual([
      "[TABLE]문제점|설명\n부상|통증[/TABLE]",
    ]);
  });

  it("굵게 표시로 감싼 마커는 굵게를 블록 안으로 옮긴다", () => {
    expect(
      normalizeBlockMarkers(["**[TIP]쿠셔닝 폼 소재의 이해**[/TIP]"]),
    ).toEqual(["[TIP]**쿠셔닝 폼 소재의 이해**[/TIP]"]);
  });

  it("닫는 태그 뒤 본문은 블록 본문으로 포함한다", () => {
    expect(
      normalizeBlockMarkers(["[TIP]힐 드롭 적응[/TIP]\n점진적으로 바꾸세요."]),
    ).toEqual(["[TIP]힐 드롭 적응\n점진적으로 바꾸세요.[/TIP]"]);
  });

  it("문단 중간 마커는 앞 문장과 분리한다", () => {
    expect(
      normalizeBlockMarkers([
        "와이드 옵션이 있습니다. [TIP] 발볼과 힐드롭 고려하기 [/TIP]",
      ]),
    ).toEqual(["와이드 옵션이 있습니다.", "[TIP]발볼과 힐드롭 고려하기[/TIP]"]);
  });

  it("블록 안에 반복된 마커는 제거한다", () => {
    expect(
      normalizeBlockMarkers([
        "[TIP]**저녁 시착:** 붓기 확인\n**[TIP]양말 착용:** 두께 확인",
      ]),
    ).toEqual([
      "[TIP]**저녁 시착:** 붓기 확인\n**양말 착용:** 두께 확인[/TIP]",
    ]);
  });

  it("정상 블록과 일반 문단은 그대로 둔다", () => {
    const content = ["[TIP]제목\n내용[/TIP]", "## 소제목", "일반 문단"];
    expect(normalizeBlockMarkers(content)).toEqual(content);
  });
});

describe("sanitizeLinks", () => {
  it("/blog/가 빠진 내부 링크를 고친다", () => {
    expect(
      sanitizeLinks("[묶기](/레이스홀-묶기-실수-물집-교환-깔창-확인)", exists),
    ).toBe("[묶기](/blog/레이스홀-묶기-실수-물집-교환-깔창-확인)");
  });

  it("@/·/_blog/·/slug: 접두사와 앵커를 정리한다", () => {
    expect(sanitizeLinks("[a](@/running-in-rain-shoe-guide)", exists)).toBe(
      "[a](/blog/running-in-rain-shoe-guide)",
    );
    expect(
      sanitizeLinks("[a](/_blog/running-in-rain-shoe-guide)", exists),
    ).toBe("[a](/blog/running-in-rain-shoe-guide)");
    expect(
      sanitizeLinks("[a](/slug:running-in-rain-shoe-guide#비)", exists),
    ).toBe("[a](/blog/running-in-rain-shoe-guide)");
  });

  it("가짜 도메인이 실제 글을 가리키면 내부 링크로 바꾼다", () => {
    expect(
      sanitizeLinks(
        "[요족](https://www.runnersguide.kr/요족-러닝화-기준-쿠션만-보면-안-되는-이유)",
        exists,
      ),
    ).toBe("[요족](/blog/요족-러닝화-기준-쿠션만-보면-안-되는-이유)");
  });

  it("해석할 수 없는 링크는 텍스트만 남긴다", () => {
    expect(
      sanitizeLinks(
        "[관련](/${internal_links[0].slug}#${internal_links[0].anchor})",
        exists,
      ),
    ).toBe("관련");
    expect(
      sanitizeLinks("[1](https://vertexaisearch.cloud.google.com/x)", exists),
    ).toBe("1");
    expect(sanitizeLinks("[글](https://example.com/없는-글)", exists)).toBe(
      "글",
    );
    expect(sanitizeLinks("[글](/없는-글)", exists)).toBe("글");
  });

  it("통합된 글로 가는 링크는 대표글로 바로 연결한다", () => {
    expect(
      sanitizeLinks("[길들이기](/blog/break-in-running-shoes)", exists),
    ).toBe("[길들이기](/blog/running-shoe-break-in-guide)");
  });

  it("정상 링크는 바꾸지 않는다", () => {
    const text =
      "[가이드](/blog/running-in-rain-shoe-guide) [도구](/tools/pace-calculator) [AOFAS](https://www.aofas.org/x)";
    expect(sanitizeLinks(text, exists)).toBe(text);
  });
});
