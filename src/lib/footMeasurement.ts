/**
 * 발 치수 입력 검증. 폭 등급 판정에는 쓰지 않는다 (브랜드·모델별 폭 표가 달라 공통 기준이 없음).
 * 입력은 기록과 안내 용도이며, 허용 범위는 입력 오류를 거르기 위한 값이다.
 */
export const FOOT_LENGTH_RANGE_MM = { min: 200, max: 330 } as const;
export const FOOT_WIDTH_RANGE_MM = { min: 70, max: 140 } as const;

export interface FootMeasurement {
  lengthMm?: number;
  widthMm?: number;
  /** 허용 범위를 벗어나거나 형식이 잘못돼 무시한 항목 */
  rejected: ("length" | "width")[];
}

const inRange = (v: number, r: { min: number; max: number }) =>
  Number.isFinite(v) && v >= r.min && v <= r.max;

export function parseFootMeasurement(
  lengthMm: number | undefined,
  widthMm: number | undefined,
): FootMeasurement {
  const rejected: FootMeasurement["rejected"] = [];
  let length = lengthMm;
  let width = widthMm;
  if (length !== undefined && !inRange(length, FOOT_LENGTH_RANGE_MM)) {
    rejected.push("length");
    length = undefined;
  }
  if (width !== undefined && !inRange(width, FOOT_WIDTH_RANGE_MM)) {
    rejected.push("width");
    width = undefined;
  }
  if (length !== undefined && width !== undefined && width >= length) {
    rejected.push("length", "width");
    length = undefined;
    width = undefined;
  }
  return { lengthMm: length, widthMm: width, rejected };
}

/** 폭/길이 비율(참고 수치). 등급이 아니라 같은 폭이라도 길이에 따라 달라짐을 보여준다. */
export const widthToLengthRatio = (m: FootMeasurement): number | undefined =>
  m.lengthMm && m.widthMm ? Math.round((m.widthMm / m.lengthMm) * 100) / 100 : undefined;
