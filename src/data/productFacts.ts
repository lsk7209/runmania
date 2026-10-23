/**
 * 외부 자료로 대조한 제품 사실과 출처. 여기에 없는 사양은 '편집부 정리·출처 미확인'으로 표시한다.
 * 새로 대조할 때마다 항목을 추가하고 확인일을 갱신한다.
 */
export interface VerifiedFact {
  label: string;
  value: string;
  source: string;
  url: string;
  checkedAt: string; // YYYY-MM-DD
}

export const VERIFIED_FACTS: Record<string, VerifiedFact[]> = {
  "뉴발란스 프레시폼 1080 v13 (2E)": [
    {
      label: "힐-토 드롭",
      value: "6mm (제조사 표기 기준 약 6mm)",
      source: "Fleet Feet 등 소매점 사양 페이지 (제조사 공식 페이지는 미확인)",
      url: "https://www.fleetfeet.com/products/mens-new-balance-fresh-foam-x-1080v13",
      checkedAt: "2026-10-23",
    },
  ],
  "나이키 페가수스 41": [
    {
      label: "출시",
      value: "2024년 6월",
      source: "Nike 공식 발표",
      url: "https://about.nike.com/en/newsroom/releases/nike-pegasus-41-official-images",
      checkedAt: "2026-10-23",
    },
  ],
};
