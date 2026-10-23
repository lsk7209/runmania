import nb1080 from "@/assets/shoes/nb-1080.png";
import nbMore from "@/assets/shoes/nb-more.png";
import asicsKayano from "@/assets/shoes/asics-kayano.png";
import brooksGts from "@/assets/shoes/brooks-gts.png";
import hokaBondi from "@/assets/shoes/hoka-bondi.png";
import sauconySpeed from "@/assets/shoes/saucony-speed.png";
import adidasBoston from "@/assets/shoes/adidas-boston.png";
import altraTorin from "@/assets/shoes/altra-torin.png";
import nikePegasus from "@/assets/shoes/nike-pegasus.png";
import nikeVaporfly from "@/assets/shoes/nike-vaporfly.png";

const shoeImages: Record<string, string> = {
  "뉴발란스 프레시폼 1080 v13 (2E)": nb1080,
  "뉴발란스 프레시폼 모어 v4": nbMore,
  "아식스 젤카야노 30": asicsKayano,
  "브룩스 아드레날린 GTS 23": brooksGts,
  "호카 본디 8": hokaBondi,
  "사코니 엔돌핀 스피드 3": sauconySpeed,
  "아디다스 아디제로 보스턴 12": adidasBoston,
  "알트라 토린 7": altraTorin,
  "나이키 페가수스 41": nikePegasus,
  "나이키 베이퍼플라이 3": nikeVaporfly,
};

export function getShoeImage(name: string): string | undefined {
  return shoeImages[name];
}

/** 신발 이미지는 AI 생성 참고 일러스트 — 실물 사진으로 오인되지 않게 표기 (docs/unique-data-plan.md 4절) */
export const ILLUSTRATION_CAPTION =
  "참고용 일러스트 · 실제 제품 사진이 아닙니다";

const ILLUSTRATION_SRCS = new Set(Object.values(shoeImages));

export function isShoeIllustration(src: string): boolean {
  return ILLUSTRATION_SRCS.has(src);
}

export function illustrationAlt(name: string): string {
  return `${name} 참고 일러스트`;
}
