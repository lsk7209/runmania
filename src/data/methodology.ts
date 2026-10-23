/**
 * 진단 방법 설명 페이지(/methodology)에 표시하는 규칙 요약.
 * 값은 src/lib/diagnosisEngine.ts의 실제 가중치와 같아야 하며,
 * src/test/methodology.test.ts가 일부 규칙을 엔진 출력으로 검증한다.
 */

export const SURVEY_QUESTIONS = [
  {
    no: 1,
    label: "현재 신는 브랜드와 착용 경험 (기타·첫 구매·모르겠음 선택 가능)",
    effect:
      "브랜드만으로 폭을 추정하지 않음. 앞볼 압박 경험은 폭 옵션 우선, 전체 헐거움은 핏 정확한 모델 우선",
  },
  {
    no: 2,
    label: "발 길이·가장 넓은 폭 (mm, 선택 입력)",
    effect:
      "입력 범위만 검증하고 폭/길이 비율을 참고로 표시. 브랜드·모델별 폭 기준이 달라 폭 등급 판정에는 쓰지 않음",
  },
  {
    no: 3,
    label: "아치 높이 (편평·정상·높음)",
    effect: "안정성·아치 규칙에 사용",
  },
  { no: 4, label: "체중 부하", effect: "체중이 많이 나가면 쿠션 규칙 적용" },
  {
    no: 5,
    label: "러닝 경력 (입문·중급·상급)",
    effect: "입문 제외 규칙과 스피드화 가산에 사용",
  },
  {
    no: 6,
    label: "현재 통증 부위 (무릎·발목·발바닥)",
    effect: "해당 부위에 맞는 신발 특성에 가산",
  },
  { no: 7, label: "선호 쿠션 (푹신함·반발력)", effect: "쿠션 취향 가산" },
] as const;

export const EXCLUDE_RULES = [
  { condition: "앞볼 압박 경험 + 와이드 옵션이 없는 모델", tag: "wide-foot", penalty: -100 },
  { condition: "편평족", tag: "flat-foot", penalty: -100 },
  { condition: "하이 아치", tag: "high-arch", penalty: -100 },
  { condition: "입문 러너", tag: "beginner", penalty: -50 },
] as const;

export const BONUS_RULES = [
  { condition: "앞볼 압박 경험 + 와이드 옵션이 있는 모델", points: 30 },
  { condition: "편평족", points: 25 },
  { condition: "하이 아치", points: 25 },
  { condition: "발목 통증", points: 25 },
  { condition: "전체 헐거움 경험", points: 20 },
  { condition: "체중 부하", points: 20 },
  { condition: "무릎 통증", points: 20 },
  { condition: "상급 러너", points: 20 },
  { condition: "발바닥 통증", points: 15 },
  { condition: "입문 러너", points: 15 },
  { condition: "편평족 + 오버프로네이션 대응 신발", points: 15 },
  { condition: "상급 + 스피드 신발", points: 15 },
  { condition: "중급 러너", points: 10 },
  { condition: "소프트 쿠션 선호", points: 10 },
  { condition: "반발력 선호", points: 10 },
  { condition: "쿠션·뉴트럴 타입 기본 가산", points: 5 },
] as const;

/** 위에서부터 먼저 해당하는 유형이 적용된다 */
export const TYPE_PRIORITY = [
  { name: "TYPE A: 구름 위 산책러", when: "앞볼 압박 경험 + 소프트 쿠션 선호" },
  { name: "TYPE B: 안정성 최우선러", when: "편평족 또는 발목 통증" },
  { name: "TYPE C: 관절 보호 러너", when: "체중 부하 또는 무릎 통증" },
  { name: "TYPE D: 스피드 체이서", when: "상급 러너" },
  { name: "TYPE E: 와이드 컴포트러", when: "앞볼 압박 경험" },
  { name: "TYPE F: 밸런스 러너", when: "위 조건에 모두 해당하지 않음" },
] as const;

export const TOOL_FORMULAS = [
  {
    tool: "심박수 구간",
    method: "Karvonen 공식 (최대심박수 = 220 − 나이)",
    path: "/tools/heart-rate-zones",
  },
  {
    tool: "완주 시간 예측",
    method: "Riegel 공식",
    path: "/tools/race-predictor",
  },
  {
    tool: "훈련 페이스",
    method: "Jack Daniels 공식",
    path: "/tools/training-paces",
  },
  {
    tool: "칼로리 계산",
    method: "METs 기반 공식",
    path: "/tools/calorie-calculator",
  },
] as const;

/** 앞볼 압박 경험이 있어도 와이드 옵션이 있는 모델은 제외하지 않고 감점 후 옵션 확인을 안내한다 */
export const WIDE_OPTION_PENALTY = -10;

export const LIMITS = [
  "폭 옵션(2E 등)은 사이트 데이터 기준이며 국내 판매 여부는 확인되지 않았습니다. 구매 전 판매처에서 확인하세요.",
  "신발 데이터는 편집부가 정리한 규칙 기반 목록이며, 개인의 발을 측정하거나 의료적으로 평가하지 않습니다.",
  "같은 점수대의 신발은 순서가 뒤바뀔 수 있고, 새 모델이 나오면 목록과 규칙이 갱신되기 전까지 반영되지 않습니다.",
  "결과는 구매 전 참고용입니다. 최종 선택은 매장에서 직접 신어 보고 결정하세요.",
  "통증이 계속되거나 심해지면 진단 도구가 아닌 정형외과·재활의학과 진료를 받으세요.",
] as const;
