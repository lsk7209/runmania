/**
 * @file diagnosisEngine.ts
 * 러닝화 선택 가이드 엔진 — 설문 응답으로 입력 프로필을 만들고, 신발 DB에 점수를 매겨
 * 시착 후보를 좁힌다. 의료적 진단이 아니라 규칙 기반 후보 선별이다.
 * 흐름: 설문 응답 → 프로필 생성 → 신발별 점수·근거 산출 → 후보/주의 모델 분류 → 결과 조립
 */
import { SHOES_DB, type DiagnosisResult, type Shoe } from "@/data/shoesDb";
import {
  parseFootMeasurement,
  widthToLengthRatio,
  FOOT_LENGTH_RANGE_MM,
  FOOT_WIDTH_RANGE_MM,
} from "@/lib/footMeasurement";

/** 기존 신발 착용 경험. 폭 추정은 이 값에서만 한다 (브랜드 일반론으로 추정하지 않음). */
export type FitFeeling =
  | "forefoot-tight" // 앞볼·새끼발가락 압박
  | "instep-tight" // 발등 압박
  | "loose" // 전체적으로 헐렁함
  | "heel-slip" // 뒤꿈치 들림
  | "fine" // 괜찮았음
  | "unknown"; // 모르겠음

/** 사용자가 진단 설문에서 입력하는 항목의 응답 구조 */
export interface UserAnswers {
  q1Brand: string; // nike | adidas | newbalance | asics | other | first | unknown
  q2Fit?: FitFeeling; // 기존 신발 착용 경험 (첫 구매·모르겠음이면 생략)
  footLengthMm?: number; // 선택 입력: 발 길이(mm)
  footWidthMm?: number; // 선택 입력: 가장 넓은 부분의 폭(mm)
  q3Arch: string; // flat / high / normal
  q4Weight: string; // light / normal / heavy
  q5Level: string; // beginner / intermediate / advanced
  q6Pain: string; // knee / ankle / sole / none
  q7Cushion: string; // soft / bouncy / balanced
}

/** 설문 응답을 불리언 플래그로 변환한 사용자 프로필 */
interface UserProfile {
  isWideFoot: boolean;
  isNarrowFoot: boolean;
  isFlatFoot: boolean;
  isHighArch: boolean;
  isOverweight: boolean;
  isAdvanced: boolean;
  isIntermediate: boolean;
  isBeginner: boolean;
  hasKneePain: boolean;
  hasAnklePain: boolean;
  hasSolePain: boolean;
  wantsSoftCushion: boolean;
  wantsBouncyCushion: boolean;
}

interface ShoeEvaluation {
  score: number;
  reasons: string[];
  notes: string[];
}

const WIDE_OPTION_NOTE =
  "와이드(2E 등) 옵션은 사이트 데이터 기준이며 국내 판매 여부는 확인되지 않았습니다. 구매 전 판매처에서 옵션을 확인하세요.";
const STANDARD_ONLY_NOTE =
  "표준 폭만 있는 모델로 정리돼 있습니다. 앞볼 압박 경험이 있다면 시착이 필수입니다.";

const hasWideOption = (shoe: Shoe) =>
  shoe.widthAvailable.some((w) => w !== "표준");

/**
 * 설문 응답을 프로필로 변환한다.
 * 폭은 '앞볼 압박(넓은 쪽)'·'전체 헐거움(좁은 쪽)' 경험에서만 추정하고,
 * 입력한 mm 치수는 폭 등급 판정에 쓰지 않는다.
 */
function buildProfile(answers: UserAnswers): UserProfile {
  return {
    isWideFoot: answers.q2Fit === "forefoot-tight",
    isNarrowFoot: answers.q2Fit === "loose",
    isFlatFoot: answers.q3Arch === "flat",
    isHighArch: answers.q3Arch === "high",
    isOverweight: answers.q4Weight === "heavy",
    isAdvanced: answers.q5Level === "advanced",
    isIntermediate: answers.q5Level === "intermediate",
    isBeginner: answers.q5Level === "beginner",
    hasKneePain: answers.q6Pain === "knee",
    hasAnklePain: answers.q6Pain === "ankle",
    hasSolePain: answers.q6Pain === "sole",
    wantsSoftCushion: answers.q7Cushion === "soft",
    wantsBouncyCushion: answers.q7Cushion === "bouncy",
  };
}

/**
 * 개별 신발의 적합도 점수와 근거를 산출한다.
 *  - 제외(ban) 조건: 음수(-100/-50)를 반환해 후보에서 뺀다.
 *    단, 넓은 폭 입력은 '와이드 옵션이 없는 모델'만 제외한다 (옵션이 있으면 감점 후 확인 안내).
 *  - bestFor 태그 매칭 시 가중치별 가산 (5~30점)
 */
function evaluateShoe(shoe: Shoe, profile: UserProfile): ShoeEvaluation {
  let score = 0;
  const reasons: string[] = [];
  const notes: string[] = [];
  const wideOption = hasWideOption(shoe);

  if (profile.isWideFoot && shoe.banFor.includes("wide-foot")) {
    if (!wideOption)
      return { score: -100, reasons, notes: [STANDARD_ONLY_NOTE] };
    score -= 10;
    notes.push(
      `이 모델은 표준 폭이 좁게 느껴질 수 있습니다. ${WIDE_OPTION_NOTE}`,
    );
  }
  if (profile.isFlatFoot && shoe.banFor.includes("flat-foot"))
    return { score: -100, reasons, notes };
  if (profile.isHighArch && shoe.banFor.includes("high-arch"))
    return { score: -100, reasons, notes };
  if (profile.isBeginner && shoe.banFor.includes("beginner"))
    return { score: -50, reasons, notes };

  if (profile.isWideFoot && wideOption && shoe.bestFor.includes("wide-foot")) {
    score += 30;
    reasons.push("앞볼 압박 경험이 있어, 폭 옵션이 있는 모델을 우선했습니다");
    notes.push(WIDE_OPTION_NOTE);
  }
  if (profile.isFlatFoot && shoe.bestFor.includes("flat-foot")) {
    score += 25;
    reasons.push("아치가 낮다고 답해 안정성 특성이 있는 모델을 우선했습니다");
  }
  if (profile.isHighArch && shoe.bestFor.includes("high-arch")) {
    score += 25;
    reasons.push("아치가 높다고 답해 쿠셔닝 중심 모델을 우선했습니다");
  }
  if (profile.isNarrowFoot && shoe.bestFor.includes("narrow-foot")) {
    score += 20;
    reasons.push("전체적으로 헐렁했다고 답해 핏이 정확한 모델을 우선했습니다");
  }
  if (profile.hasAnklePain && shoe.bestFor.includes("ankle-pain")) {
    score += 25;
    reasons.push("발목 안쪽이 신경 쓰인다고 답해 안정성 모델을 우선했습니다");
  }
  if (profile.isOverweight && shoe.bestFor.includes("overweight")) {
    score += 20;
    reasons.push("체격 조건을 고려해 쿠셔닝 볼륨이 큰 모델을 우선했습니다");
  }
  if (profile.hasKneePain && shoe.bestFor.includes("knee-pain")) {
    score += 20;
    reasons.push(
      "무릎이 신경 쓰인다고 답해 충격 흡수가 큰 모델을 우선했습니다",
    );
  }
  if (profile.hasSolePain && shoe.bestFor.includes("sole-pain")) {
    score += 15;
    reasons.push(
      "발바닥이 신경 쓰인다고 답해 쿠셔닝·아치 지지 모델을 우선했습니다",
    );
  }
  if (profile.isAdvanced && shoe.bestFor.includes("advanced")) {
    score += 20;
    reasons.push("기록 단축 목적에 맞는 모델입니다");
  }
  if (profile.isIntermediate && shoe.bestFor.includes("intermediate")) {
    score += 10;
    reasons.push("주 2~3회 취미 러닝에 두루 쓰는 모델입니다");
  }
  if (profile.isBeginner && shoe.bestFor.includes("beginner")) {
    score += 15;
    reasons.push("입문 단계에서 적응하기 쉬운 모델입니다");
  }
  if (profile.wantsSoftCushion && shoe.bestFor.includes("soft-cushion")) {
    score += 10;
    reasons.push("푹신한 쿠션 선호와 맞습니다");
  }
  if (profile.wantsBouncyCushion && shoe.bestFor.includes("bouncy-cushion")) {
    score += 10;
    reasons.push("반발력 선호와 맞습니다");
  }

  if (profile.isFlatFoot && shoe.bestFor.includes("overpronation")) {
    score += 15;
    reasons.push("발이 안쪽으로 무너지는 경향 대응 특성이 있습니다");
  }
  if (profile.isAdvanced && shoe.bestFor.includes("speed")) {
    score += 15;
    reasons.push("스피드 훈련·대회용 특성이 있습니다");
  }

  // 기본 가산: 특별한 조건이 없는 사용자에게도 데일리 트레이너가 상위에 오도록 보정
  if (shoe.type === "cushion" || shoe.type === "neutral") score += 5;

  return { score, reasons, notes };
}

/** 러너 유형 이름과 설명. 우선순위: 와이드+소프트 > 편평/발목 > 체중/무릎 > 상급 > 와이드 > 기본 */
function getTypeName(profile: UserProfile): {
  name: string;
  description: string;
} {
  if (profile.isWideFoot && profile.wantsSoftCushion) {
    return {
      name: "TYPE A: 구름 위 산책러",
      description: "앞볼 여유 + 푹신한 쿠션 선호",
    };
  }
  if (profile.isFlatFoot || profile.hasAnklePain) {
    return {
      name: "TYPE B: 안정성 최우선러",
      description: "낮은 아치·발목 불안 입력, 안정성 우선 후보",
    };
  }
  if (profile.isOverweight || profile.hasKneePain) {
    return {
      name: "TYPE C: 관절 보호 러너",
      description: "체격·무릎 입력, 쿠셔닝 우선 후보",
    };
  }
  if (profile.isAdvanced) {
    return {
      name: "TYPE D: 스피드 체이서",
      description: "기록 단축 + 반발력 선호",
    };
  }
  if (profile.isWideFoot) {
    return {
      name: "TYPE E: 와이드 컴포트러",
      description: "앞볼 여유가 필요한 핏",
    };
  }
  return {
    name: "TYPE F: 밸런스 러너",
    description: "균형 잡힌 쿠셔닝 + 안정성",
  };
}

function getFootProfile(profile: UserProfile) {
  return {
    width: profile.isWideFoot
      ? "앞볼 압박 경험 (폭 옵션 확인 권장)"
      : profile.isNarrowFoot
        ? "전체적으로 헐렁했음"
        : "폭 정보 부족 (시착으로 확인)",
    arch: profile.isFlatFoot
      ? "낮은 편 (편평 성향)"
      : profile.isHighArch
        ? "높은 편"
        : "보통",
    cushionNeed:
      profile.isOverweight || profile.hasKneePain || profile.hasSolePain
        ? "높음"
        : profile.isAdvanced
          ? "중간"
          : "보통",
    stabilityNeed: profile.isFlatFoot || profile.hasAnklePain ? "높음" : "보통",
  };
}

/** 입력에서 알 수 없었거나 보정된 부분을 결과에 설명한다. */
function getMissingInfo(answers: UserAnswers): string[] {
  const items: string[] = [];
  const measured = parseFootMeasurement(
    answers.footLengthMm,
    answers.footWidthMm,
  );
  const noFitInfo = !answers.q2Fit || answers.q2Fit === "unknown";
  if (noFitInfo) {
    items.push(
      "기존 신발의 폭 착용 경험이 없어 폭은 판단하지 않았습니다. 시착해서 앞볼 압박을 확인하세요.",
    );
  }
  if (measured.rejected.length > 0) {
    items.push(
      `입력 범위를 벗어난 치수는 반영하지 않았습니다 (길이 ${FOOT_LENGTH_RANGE_MM.min}~${FOOT_LENGTH_RANGE_MM.max}mm, 폭 ${FOOT_WIDTH_RANGE_MM.min}~${FOOT_WIDTH_RANGE_MM.max}mm, 폭은 길이보다 작아야 함).`,
    );
  }
  const ratio = widthToLengthRatio(measured);
  if (ratio) {
    items.push(
      `입력한 치수의 폭/길이 비율은 ${ratio}입니다. 브랜드·모델마다 폭 기준이 달라 이 값으로 폭 등급을 정하지는 않았습니다.`,
    );
  } else if (!measured.rejected.length) {
    items.push(
      "발 길이·폭을 입력하지 않았습니다. 매장 측정이나 직접 측정값이 있으면 시착 사이즈를 고를 때 도움이 됩니다.",
    );
  }
  if (answers.q6Pain !== "none") {
    items.push(
      "통증이 있다면 신발 선택만으로 원인을 판단할 수 없습니다. 지속되면 의료진 상담을 권합니다.",
    );
  }
  return items;
}

const BASE_FIT_CHECKS = [
  "발가락 끝에서 신발 앞쪽까지 한 엄지 정도 여유가 있는지",
  "가장 넓은 부분(앞볼)이 눌리지 않는지",
  "뒤꿈치가 들리지 않고 발등이 조이지 않는지",
  "저녁 무렵(발이 커진 상태) 양쪽을 모두 신어 걸어 보기",
];

function getFitChecks(answers: UserAnswers): string[] {
  const checks = [...BASE_FIT_CHECKS];
  if (answers.q2Fit === "instep-tight")
    checks.push("발등 부분 끈 조절 후에도 눌리는 곳이 없는지");
  if (answers.q2Fit === "heel-slip")
    checks.push(
      "끈을 매어도 뒤꿈치가 들리면 신발 구조(힐 카운터)가 맞지 않을 수 있음",
    );
  return checks;
}

function getTags(profile: UserProfile): string[] {
  const tags: string[] = [];
  if (profile.isWideFoot) tags.push("앞볼 압박 경험");
  if (profile.isNarrowFoot) tags.push("헐거운 핏 경험");
  if (profile.isFlatFoot) tags.push("낮은 아치");
  if (profile.isHighArch) tags.push("높은 아치");
  if (profile.isOverweight) tags.push("체격 고려");
  if (profile.hasKneePain) tags.push("무릎 신경 쓰임");
  if (profile.hasAnklePain) tags.push("발목 신경 쓰임");
  if (profile.hasSolePain) tags.push("발바닥 신경 쓰임");
  if (profile.isAdvanced) tags.push("상급 러너");
  if (profile.isBeginner) tags.push("입문 러너");
  if (profile.wantsSoftCushion) tags.push("소프트 쿠션");
  if (profile.wantsBouncyCushion) tags.push("반발력 선호");
  return tags;
}

function getSelectionGuide(recommended: Shoe, cautionCount: number): string {
  const parts = [
    `시착 1순위 후보는 '${recommended.name}'입니다. ${recommended.description}`,
    "제품 사양과 폭 옵션은 사이트 데이터 기준이니 구매 전 판매처에서 확인하세요.",
  ];
  if (cautionCount > 0) {
    parts.push(
      `입력 조건과 맞지 않을 수 있어 우선순위를 낮춘 모델이 ${cautionCount}개 있습니다.`,
    );
  }
  return parts.join(" ");
}

/** 진단 엔진의 진입점. 설문 응답을 받아 시착 후보 결과를 반환한다. */
export function diagnose(answers: UserAnswers): DiagnosisResult {
  const profile = buildProfile(answers);
  const evaluated = SHOES_DB.map((shoe) => ({
    shoe,
    ...evaluateShoe(shoe, profile),
  }));
  const ranked = evaluated
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);
  const caution = evaluated.filter((e) => e.score <= -50).map((e) => e.shoe);
  const best = ranked[0] ?? {
    shoe: SHOES_DB[0],
    score: 0,
    reasons: [],
    notes: [],
  };
  const alternatives = ranked.slice(1, 3);
  const { name, description } = getTypeName(profile);

  const reasons: Record<string, string[]> = {};
  const notes: Record<string, string[]> = {};
  for (const e of [best, ...alternatives]) {
    reasons[e.shoe.name] = e.reasons;
    notes[e.shoe.name] = e.notes;
  }

  return {
    typeName: name,
    typeDescription: description,
    recommended: best.shoe,
    alternatives: alternatives.map((e) => e.shoe),
    caution,
    selectionGuide: getSelectionGuide(best.shoe, caution.length),
    tags: getTags(profile),
    footProfile: getFootProfile(profile),
    reasons,
    notes,
    fitChecks: getFitChecks(answers),
    missingInfo: getMissingInfo(answers),
    lowConfidence: best.reasons.length === 0,
  };
}
