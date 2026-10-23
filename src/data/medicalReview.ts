/**
 * 건강 주제 글의 감수·출처 정보.
 * 감수자가 실제로 확정되기 전에는 null로 둔다 (가상의 감수자 표기 금지).
 */
export interface MedicalReviewer {
  name: string;
  credential: string;
  reviewedAt: string;
}

export const MEDICAL_REVIEWER: MedicalReviewer | null = null;

export const OFFICIAL_HEALTH_SOURCES = [
  { label: "국가건강정보포털 (질병관리청)", url: "https://health.kdca.go.kr" },
  { label: "대한정형외과학회", url: "https://www.koa.or.kr" },
] as const;
