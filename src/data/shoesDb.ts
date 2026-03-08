export interface Shoe {
  name: string;
  brand: string;
  type: "cushion" | "stability" | "max-cushion" | "speed" | "neutral";
  widthAvailable: ("표준" | "2E" | "4E")[];
  bestFor: string[];
  banFor: string[];
  description: string;
  cushionLevel: number; // 1-5
  stabilityLevel: number; // 1-5
  weightGrams: number;
  dropMm: number;
  priceRange: string;
}

export const SHOES_DB: Shoe[] = [
  {
    name: "뉴발란스 프레시폼 1080 v13 (2E)",
    brand: "뉴발란스",
    type: "cushion",
    widthAvailable: ["표준", "2E", "4E"],
    bestFor: ["wide-foot", "soft-cushion", "beginner", "knee-pain", "high-arch", "intermediate"],
    banFor: [],
    description: "넓은 발볼과 푹신한 쿠셔닝이 필요한 러너에게 최적. 2E/4E 사이즈로 압박 없는 편안함.",
    cushionLevel: 4,
    stabilityLevel: 2,
    weightGrams: 309,
    dropMm: 8,
    priceRange: "17~19만원",
  },
  {
    name: "뉴발란스 프레시폼 모어 v4",
    brand: "뉴발란스",
    type: "max-cushion",
    widthAvailable: ["표준", "2E", "4E"],
    bestFor: ["wide-foot", "overweight", "knee-pain", "soft-cushion", "sole-pain", "high-arch"],
    banFor: [],
    description: "최대 쿠셔닝으로 무릎과 관절을 보호. 체중이 있는 러너에게 강력 추천.",
    cushionLevel: 5,
    stabilityLevel: 2,
    weightGrams: 332,
    dropMm: 4,
    priceRange: "18~20만원",
  },
  {
    name: "아식스 젤카야노 30",
    brand: "아식스",
    type: "stability",
    widthAvailable: ["표준", "2E"],
    bestFor: ["flat-foot", "ankle-pain", "overpronation", "beginner"],
    banFor: ["high-arch"],
    description: "오버프로네이션을 교정하는 안정성 러닝화. 편평족과 발목 보호에 최적.",
    cushionLevel: 4,
    stabilityLevel: 5,
    weightGrams: 310,
    dropMm: 10,
    priceRange: "16~19만원",
  },
  {
    name: "브룩스 아드레날린 GTS 23",
    brand: "브룩스",
    type: "stability",
    widthAvailable: ["표준", "2E", "4E"],
    bestFor: ["flat-foot", "ankle-pain", "wide-foot", "overpronation"],
    banFor: ["high-arch"],
    description: "가이드레일 시스템으로 발목을 안정적으로 잡아주는 안정화. 넓은 발볼 옵션.",
    cushionLevel: 3,
    stabilityLevel: 5,
    weightGrams: 290,
    dropMm: 12,
    priceRange: "15~18만원",
  },
  {
    name: "호카 본디 8",
    brand: "호카",
    type: "max-cushion",
    widthAvailable: ["표준", "2E"],
    bestFor: ["overweight", "knee-pain", "soft-cushion", "sole-pain", "high-arch"],
    banFor: ["wide-foot"],
    description: "맥시멀 쿠셔닝의 대명사. 무릎 보호와 충격 흡수에 탁월.",
    cushionLevel: 5,
    stabilityLevel: 3,
    weightGrams: 307,
    dropMm: 4,
    priceRange: "18~22만원",
  },
  {
    name: "사코니 엔돌핀 스피드 3",
    brand: "사코니",
    type: "speed",
    widthAvailable: ["표준"],
    bestFor: ["advanced", "bouncy-cushion", "speed"],
    banFor: ["wide-foot", "beginner"],
    description: "나일론 플레이트 탑재 레이싱 트레이너. 기록 단축을 목표로 하는 러너에게.",
    cushionLevel: 3,
    stabilityLevel: 2,
    weightGrams: 215,
    dropMm: 8,
    priceRange: "16~19만원",
  },
  {
    name: "아디다스 아디제로 보스턴 12",
    brand: "아디다스",
    type: "speed",
    widthAvailable: ["표준"],
    bestFor: ["advanced", "bouncy-cushion", "speed"],
    banFor: ["wide-foot", "beginner"],
    description: "라이트스트라이크 프로 폼으로 빠른 템포 런에 최적화된 레이싱 슈즈.",
    cushionLevel: 3,
    stabilityLevel: 2,
    weightGrams: 240,
    dropMm: 6,
    priceRange: "15~18만원",
  },
  {
    name: "알트라 토린 7",
    brand: "알트라",
    type: "cushion",
    widthAvailable: ["표준", "2E"],
    bestFor: ["wide-foot", "soft-cushion", "sole-pain", "intermediate"],
    banFor: [],
    description: "발가락 모양 그대로의 넓은 토박스. 자연스러운 발 움직임을 추구하는 러너에게.",
    cushionLevel: 3,
    stabilityLevel: 2,
    weightGrams: 272,
    dropMm: 0,
    priceRange: "15~17만원",
  },
  {
    name: "나이키 페가수스 41",
    brand: "나이키",
    type: "neutral",
    widthAvailable: ["표준"],
    bestFor: ["narrow-foot", "bouncy-cushion", "intermediate"],
    banFor: ["wide-foot"],
    description: "나이키의 대표 러닝화이지만 좁은 발볼 설계로 넓은 발에는 고통을 유발.",
    cushionLevel: 3,
    stabilityLevel: 2,
    weightGrams: 285,
    dropMm: 10,
    priceRange: "14~16만원",
  },
  {
    name: "나이키 베이퍼플라이 3",
    brand: "나이키",
    type: "speed",
    widthAvailable: ["표준"],
    bestFor: ["advanced", "narrow-foot", "speed"],
    banFor: ["wide-foot", "flat-foot"],
    description: "카본 플레이트 레이싱화. 불안정한 구조로 편평족에게 위험.",
    cushionLevel: 3,
    stabilityLevel: 1,
    weightGrams: 186,
    dropMm: 8,
    priceRange: "28~32만원",
  },
];

export interface DiagnosisResult {
  typeName: string;
  typeDescription: string;
  recommended: Shoe;
  alternatives: Shoe[];
  banned: Shoe[];
  prescriptionDetail: string;
  tags: string[];
  footProfile: {
    width: string;
    arch: string;
    cushionNeed: string;
    stabilityNeed: string;
  };
}
