/**
 * @file metaText.ts
 * AI 생성 제목·메타·요약의 표현 정리 (DB 원본은 그대로, 응답/프리렌더 시점에 적용).
 * - 자리표시 문자열([사이트명]) 치환
 * - 감수·자격 근거 없는 "전문가" 권위 주장 완화 (docs/content-audit-2026-10.md)
 *   "전문가 슈피팅"처럼 사실을 가리키는 표현과 "전문의와 상담" 권고는 그대로 둔다.
 */
const SITE_NAME = "런닝화매니아";

const REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  [/\[(사이트명|사이트 이름)\]/g, SITE_NAME],
  // "전문가의 해결책으로/조언을" → "실용적인 해결책으로/조언을"
  [/전문가의 (실질적인\s*)?(통찰|해결책|가이드|조언)/g, "실용적인 $2"],
  // 관점·방법·수준·자격 주장은 삭제
  [/전문가의 (시선|시각)(으로|에서)\s*/g, ""],
  [/전문가 관점에서\s*/g, ""],
  [/전문가(적 | 수준의 |처럼 |가 )/g, ""],
  // 수식어로 붙은 "전문가 가이드/체크리스트/팁"
  [/전문가 (가이드|체크리스트|팁)/g, "$1"],
];

export function softenMetaText(text: string): string {
  return REPLACEMENTS.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    text,
  )
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** 문자열이 아닌 값은 그대로 둔다 */
export function softenMetaValue<T>(value: T): T {
  return (typeof value === "string" ? softenMetaText(value) : value) as T;
}
