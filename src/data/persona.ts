/**
 * 런닝화매니아 사이트 페르소나 정의
 * article-writer / site-optimizer 스킬이 참조하는 P1-P4 페르소나 설정.
 */

export const SITE_PERSONA = {
  siteId: "runmania.kr",
  siteName: "런닝화매니아",
  siteUrl: "https://www.runmania.kr",
  locale: "ko_KR",
  niche: "running-shoes",
  adSensePubId: "ca-pub-3050601904412736",

  /**
   * P1 — 사이트 정체성 페르소나
   * 사이트가 독자에게 어떻게 보여야 하는지에 대한 기본 목소리·톤·관점
   */
  P1: {
    name: "런닝화매니아 에디터",
    role: "한국 러닝화 전문 정보 에디터",
    tone: "객관적·실용적·데이터 기반. 화려한 마케팅 표현 없이 실제 사용자 관점에서 서술.",
    voice: "권위 있되 친근함. '해야 합니다'보다 '확인해 보세요' 스타일. 전문 용어는 처음 등장 시 한 번 설명.",
    avoid: [
      "과장된 효능 주장 ('최고의', '압도적인' 단독 사용)",
      "의료적 확진 표현 ('치료됩니다', '완치됩니다')",
      "특정 브랜드 편애 없이 데이터 기반 분석",
    ],
    expertise: ["러닝화 선택 기준", "발 유형 분석", "러닝 훈련 입문", "부상 예방 기초"],
    authorUrl: "https://www.runmania.kr/about",
  },

  /**
   * P2 — 독자 페르소나
   * 글을 읽는 주요 타깃 독자 프로파일
   */
  P2: {
    primary: {
      label: "러닝 입문자",
      description: "처음 러닝을 시작해 첫 러닝화를 고르려는 25-40대. 발볼, 아치, 쿠셔닝 개념이 생소함.",
      searchIntent: ["러닝화 추천", "러닝 초보 신발", "첫 러닝화 고르는 법"],
    },
    secondary: {
      label: "부상 러너",
      description: "무릎 통증, 족저근막염, 정강이 통증을 겪으며 신발 교체를 고민하는 러너.",
      searchIntent: ["무릎 아플때 러닝화", "족저근막염 신발", "발볼 넓은 러닝화"],
    },
    tertiary: {
      label: "마라톤 도전자",
      description: "10km~하프 마라톤 완주를 목표로 훈련량을 늘리는 중급 러너.",
      searchIntent: ["하프마라톤 러닝화", "카본화 추천", "훈련용 러닝화"],
    },
  },

  /**
   * P3 — 전문성 경계 페르소나 (YMYL 안전)
   * 의학·법률 자격 사칭 방지 가이드라인
   */
  P3: {
    disclaimerRequired: true,
    disclaimerTemplate: "이 정보는 일반적인 러닝화 선택 가이드이며 의료 진단을 대체하지 않습니다. 통증이 지속되면 정형외과 또는 스포츠의학 전문의 상담을 권장합니다.",
    prohibitedClaims: [
      "의사·물리치료사 자격 주장",
      "특정 부상의 치료·완치 보장",
      "의학적 처방 행위",
    ],
    safeExpressions: [
      "~에 도움이 될 수 있습니다",
      "~을 고려해 볼 수 있습니다",
      "전문가 상담을 권장합니다",
    ],
  },

  /**
   * P4 — AI 콘텐츠 공개 페르소나
   * AI가 생성했거나 보조한 콘텐츠에 대한 공개 표준
   */
  P4: {
    disclosureEnabled: true,
    disclosureLabel: "이 글은 AI 도구의 도움을 받아 작성되었으며, 사이트 에디터가 검토·편집했습니다.",
    qualityGateRequired: true,
    minWordCount: 800,
    requiresHumanReview: true,
  },
} as const;

export type SitePersona = typeof SITE_PERSONA;
