/**
 * 빌드 후 핵심 페이지의 정적 HTML 생성 스크립트.
 * 각 라우트별로 올바른 title/description/canonical/OG 태그를 주입해
 * 크롤러(구글봇, 네이버 Yeti, AI봇 등)가 메타데이터를 읽을 수 있도록 한다.
 * 실행: npx tsx scripts/prerender.ts (vite build 후 자동 실행)
 */

import * as fs from "fs";
import * as path from "path";

const DIST = path.resolve(process.cwd(), "dist");
const BASE_URL = "https://runmania.kr";

interface RouteConfig {
  path: string;
  title: string;
  description: string;
  keywords: string;
}

const ROUTES: RouteConfig[] = [
  {
    path: "/",
    title: "러닝화 추천 · 무료 발 진단 · 신발 리뷰 | 런닝화매니아",
    description:
      "3분 무료 발 진단으로 내 발 유형(평발·요족·정상)에 맞는 최적의 러닝화를 추천받으세요. 러닝화 리뷰, 달리기 팁, 훈련 계획까지.",
    keywords: "러닝화 추천, 발 진단, 러닝화 리뷰, 족저근막염 신발, 평발 러닝화",
  },
  {
    path: "/tools/diagnosis",
    title: "무료 발 진단 — 내 발에 맞는 러닝화 추천 | 런닝화매니아",
    description:
      "3분 발 진단으로 내 발 유형(평발/요족/정상), 달리기 목적, 체중에 맞는 러닝화를 무료로 추천받으세요.",
    keywords: "발 진단, 러닝화 추천, 평발 러닝화, 요족 러닝화, 무료 발 분석",
  },
  {
    path: "/blog",
    title: "러닝화 블로그 — 러닝화 가이드 & 달리기 팁 | 런닝화매니아",
    description:
      "러닝화 선택법, 달리기 훈련, 부상 예방, 브랜드 비교 등 러너를 위한 전문 블로그.",
    keywords: "러닝화 블로그, 러닝화 선택법, 달리기 훈련, 마라톤 가이드",
  },
  {
    path: "/reviews",
    title: "러닝화 리뷰 — 29개 모델 상세 비교 | 런닝화매니아",
    description:
      "아식스 카야노, 나이키 페가수스, 호카 본다이 등 국내 유통 러닝화 29개 모델 상세 리뷰 및 스펙 비교.",
    keywords: "러닝화 리뷰, 러닝화 비교, 아식스 리뷰, 나이키 리뷰, 호카 리뷰",
  },
  {
    path: "/tools",
    title: "러닝 유틸리티 도구 모음 | 런닝화매니아",
    description:
      "달리기 칼로리 계산기, 심박수 구간, 마라톤 완주 예측, 훈련 페이스 계산기 등 러너를 위한 8가지 필수 도구.",
    keywords:
      "러닝 계산기, 달리기 칼로리, 마라톤 완주 예측, 훈련 페이스, 심박수 구간",
  },
  {
    path: "/tools/calorie-calculator",
    title: "달리기 칼로리 계산기 | 런닝화매니아",
    description:
      "체중·달리기 페이스·시간을 입력하면 소모 칼로리를 METs 공식으로 정확하게 계산합니다.",
    keywords: "달리기 칼로리 계산, 러닝 칼로리, 조깅 칼로리 소모",
  },
  {
    path: "/tools/heart-rate-zones",
    title: "심박수 훈련 구간 계산기 (Z1~Z5) | 런닝화매니아",
    description:
      "나이와 안정시 심박수로 Z1~Z5 훈련 심박수 구간을 Karvonen 공식으로 계산합니다.",
    keywords: "심박수 훈련 구간, 최대심박수 계산, 달리기 심박수",
  },
  {
    path: "/tools/race-predictor",
    title: "마라톤 완주 시간 예측기 | 런닝화매니아",
    description:
      "최근 달리기 기록으로 5km·하프마라톤·풀마라톤 예상 완주 시간을 Riegel 공식으로 예측합니다.",
    keywords: "마라톤 완주 예측, 서브4 가능 계산, 하프마라톤 예측",
  },
  {
    path: "/tools/training-paces",
    title: "훈련 페이스 계산기 | 런닝화매니아",
    description:
      "레이스 기록으로 쉬운 조깅·템포런·인터벌 등 5가지 훈련 구간 페이스를 계산합니다.",
    keywords: "훈련 페이스 계산, 인터벌 페이스, 템포런 페이스",
  },
  {
    path: "/tools/training-paces",
    title: "훈련 페이스 계산기 | 런닝화매니아",
    description:
      "레이스 기록으로 쉬운 조깅·템포런·인터벌 등 5가지 훈련 구간 페이스를 계산합니다.",
    keywords: "훈련 페이스 계산, 인터벌 페이스, 템포런 페이스",
  },
  {
    path: "/tools/weight-loss",
    title: "달리기 체중 감량 계산기 | 런닝화매니아",
    description:
      "주간 달리기 습관으로 목표 체중까지 얼마나 걸릴지 현실적으로 계산합니다.",
    keywords: "달리기 다이어트, 러닝 체중 감량, 달리기로 살빼기",
  },
  {
    path: "/tools/pace-calculator",
    title: "러닝 페이스 계산기 | 런닝화매니아",
    description:
      "완주 시간·거리·페이스를 상호 변환하고 목표 페이스를 설정합니다.",
    keywords: "러닝 페이스 계산기, 마라톤 페이스, 달리기 속도 변환",
  },
  {
    path: "/tools/size-converter",
    title: "러닝화 사이즈 변환기 — KR·US·EU·UK | 런닝화매니아",
    description:
      "한국(mm), US, EU, UK 전 세계 러닝화 사이즈를 간편하게 상호 변환합니다.",
    keywords: "러닝화 사이즈 변환, 운동화 사이즈 변환, US 사이즈 한국",
  },
];

function injectMeta(html: string, route: RouteConfig): string {
  const canonical = `${BASE_URL}${route.path === "/" ? "" : route.path}`;

  return html
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeHtml(route.title)}</title>`,
    )
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(route.description)}" />`,
    )
    .replace(
      /<meta name="keywords"[^>]*>/,
      `<meta name="keywords" content="${escapeHtml(route.keywords)}" />`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${canonical}" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${canonical}" />`,
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
    );
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const indexHtml = path.join(DIST, "index.html");
  if (!fs.existsSync(indexHtml)) {
    console.error("❌ dist/index.html not found. Run vite build first.");
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtml, "utf-8");
  console.log(`🚀 Prerendering ${ROUTES.length} routes...\n`);

  // deduplicate routes
  const seen = new Set<string>();
  for (const route of ROUTES) {
    if (seen.has(route.path)) continue;
    seen.add(route.path);

    const html = injectMeta(baseHtml, route);
    const routePath = route.path === "/" ? "" : route.path;
    const dir = path.join(DIST, routePath);
    ensureDir(dir);
    const outFile = path.join(dir, "index.html");
    fs.writeFileSync(outFile, html, "utf-8");
    console.log(`✅ ${route.path} → dist${routePath}/index.html`);
  }

  console.log("\n✅ Prerender complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
