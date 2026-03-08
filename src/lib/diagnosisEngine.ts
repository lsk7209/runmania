import { SHOES_DB, type DiagnosisResult, type Shoe } from "@/data/shoesDb";

export interface UserAnswers {
  q1Brand: string;
  q1SubFeeling?: string;
  q2Width: string;
  q3Arch: string;
  q4Weight: string;
  q5Level: string;
  q6Pain: string;
  q7Cushion: string;
}

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

function buildProfile(answers: UserAnswers): UserProfile {
  const isWideFoot =
    answers.q2Width === "wide" ||
    (answers.q1Brand === "nike" && answers.q1SubFeeling === "pinky-pain");

  const isNarrowFoot =
    answers.q2Width === "narrow" ||
    (answers.q1Brand === "nike" && answers.q1SubFeeling === "loose");

  return {
    isWideFoot,
    isNarrowFoot,
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

function scoreShoe(shoe: Shoe, profile: UserProfile): number {
  let score = 0;

  // Ban rules (early return)
  if (profile.isWideFoot && shoe.banFor.includes("wide-foot")) return -100;
  if (profile.isFlatFoot && shoe.banFor.includes("flat-foot")) return -100;
  if (profile.isHighArch && shoe.banFor.includes("high-arch")) return -100;
  if (profile.isBeginner && shoe.banFor.includes("beginner")) return -50;

  // bestFor scoring
  if (profile.isWideFoot && shoe.bestFor.includes("wide-foot")) score += 30;
  if (profile.isFlatFoot && shoe.bestFor.includes("flat-foot")) score += 25;
  if (profile.isHighArch && shoe.bestFor.includes("high-arch")) score += 25;
  if (profile.isNarrowFoot && shoe.bestFor.includes("narrow-foot")) score += 20;
  if (profile.hasAnklePain && shoe.bestFor.includes("ankle-pain")) score += 25;
  if (profile.isOverweight && shoe.bestFor.includes("overweight")) score += 20;
  if (profile.hasKneePain && shoe.bestFor.includes("knee-pain")) score += 20;
  if (profile.hasSolePain && shoe.bestFor.includes("sole-pain")) score += 15;
  if (profile.isAdvanced && shoe.bestFor.includes("advanced")) score += 20;
  if (profile.isIntermediate && shoe.bestFor.includes("intermediate")) score += 10;
  if (profile.isBeginner && shoe.bestFor.includes("beginner")) score += 15;
  if (profile.wantsSoftCushion && shoe.bestFor.includes("soft-cushion")) score += 10;
  if (profile.wantsBouncyCushion && shoe.bestFor.includes("bouncy-cushion")) score += 10;

  // Dead tag scoring: overpronation → flat foot association, speed → advanced
  if (profile.isFlatFoot && shoe.bestFor.includes("overpronation")) score += 15;
  if (profile.isAdvanced && shoe.bestFor.includes("speed")) score += 15;

  // Baseline scoring for normal/neutral profiles: daily trainers and versatile shoes
  if (shoe.type === "cushion" || shoe.type === "neutral") score += 5;

  return score;
}

function getTypeName(profile: UserProfile): { name: string; description: string } {
  if (profile.isWideFoot && profile.wantsSoftCushion) {
    return { name: "TYPE A: 구름 위 산책러", description: "왕발볼 + 맥스 쿠션 요망" };
  }
  if (profile.isFlatFoot || profile.hasAnklePain) {
    return { name: "TYPE B: 안정성 최우선러", description: "편평족 + 오버프로네이션 교정 필요" };
  }
  if (profile.isOverweight || profile.hasKneePain) {
    return { name: "TYPE C: 관절 보호 러너", description: "체중 부하 + 무릎 보호 최적화" };
  }
  if (profile.isAdvanced) {
    return { name: "TYPE D: 스피드 체이서", description: "기록 단축 + 반발력 극대화" };
  }
  if (profile.isWideFoot) {
    return { name: "TYPE E: 와이드 컴포트러", description: "넓은 발볼 + 편안한 피팅" };
  }
  return { name: "TYPE F: 밸런스 러너", description: "균형 잡힌 쿠셔닝 + 안정성" };
}

function getFootProfile(profile: UserProfile) {
  return {
    width: profile.isWideFoot ? "넓음 (Wide)" : profile.isNarrowFoot ? "좁음 (Narrow)" : "표준 (Standard)",
    arch: profile.isFlatFoot ? "편평족 (Flat)" : profile.isHighArch ? "하이아치 (High)" : "정상 (Normal)",
    cushionNeed: (profile.isOverweight || profile.hasKneePain || profile.hasSolePain) ? "높음" : profile.isAdvanced ? "중간" : "보통",
    stabilityNeed: (profile.isFlatFoot || profile.hasAnklePain) ? "높음" : "보통",
  };
}

function getPrescriptionDetail(profile: UserProfile, recommended: Shoe, banned: Shoe[]): string {
  const parts: string[] = [];
  if (profile.isWideFoot) {
    parts.push("당신은 발볼이 넓은 타입입니다. 나이키 등 좁은 라스트의 신발은 새끼발가락 통증과 물집을 유발합니다.");
  }
  if (profile.isFlatFoot) {
    parts.push("편평족(과내전) 소견이 있습니다. 안정성 기능이 없는 신발은 발목 안쪽에 과도한 부하를 줍니다.");
  }
  if (profile.isOverweight || profile.hasKneePain) {
    parts.push("체중 부하가 큰 조건입니다. 충분한 쿠셔닝이 없으면 무릎 연골에 충격이 누적됩니다.");
  }
  if (profile.hasSolePain) {
    parts.push("족저근막 통증 위험이 있습니다. 아치 서포트와 충분한 쿠셔닝이 핵심입니다.");
  }
  parts.push(`처방 신발 '${recommended.name}'은(는) ${recommended.description}`);
  if (banned.length > 0) {
    parts.push(`⚠️ ${banned.map(s => s.name).join(", ")}은(는) 현재 발 상태에 적합하지 않으므로 착용을 금합니다.`);
  }
  return parts.join(" ");
}

function getTags(profile: UserProfile): string[] {
  const tags: string[] = [];
  if (profile.isWideFoot) tags.push("발볼 넓음");
  if (profile.isNarrowFoot) tags.push("발볼 좁음");
  if (profile.isFlatFoot) tags.push("편평족");
  if (profile.isHighArch) tags.push("하이아치");
  if (profile.isOverweight) tags.push("체중 부하");
  if (profile.hasKneePain) tags.push("무릎 통증");
  if (profile.hasAnklePain) tags.push("발목 통증");
  if (profile.hasSolePain) tags.push("족저근막");
  if (profile.isAdvanced) tags.push("상급 러너");
  if (profile.isBeginner) tags.push("입문 러너");
  if (profile.wantsSoftCushion) tags.push("소프트 쿠션");
  if (profile.wantsBouncyCushion) tags.push("반발력 선호");
  return tags;
}

export function diagnose(answers: UserAnswers): DiagnosisResult {
  const profile = buildProfile(answers);
  const scored = SHOES_DB.map((shoe) => ({ shoe, score: scoreShoe(shoe, profile) }));
  const recommended = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  const banned = scored.filter((s) => s.score <= -50).map((s) => s.shoe);
  const bestShoe = recommended[0]?.shoe ?? SHOES_DB[0];
  const alternatives = recommended.slice(1, 3).map((s) => s.shoe);
  const { name, description } = getTypeName(profile);

  return {
    typeName: name,
    typeDescription: description,
    recommended: bestShoe,
    alternatives,
    banned,
    prescriptionDetail: getPrescriptionDetail(profile, bestShoe, banned),
    tags: getTags(profile),
    footProfile: getFootProfile(profile),
  };
}
