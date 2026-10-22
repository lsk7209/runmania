/**
 * 빌드 후 핵심 페이지의 정적 HTML 생성 스크립트.
 * 각 라우트별로 올바른 title/description/canonical/OG 태그를 주입해
 * 크롤러(구글봇, 네이버 Yeti, AI봇 등)가 메타데이터를 읽을 수 있도록 한다.
 * 실행: npx tsx scripts/prerender.ts (vite build 후 자동 실행)
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@libsql/client";
import { isNoindexPost } from "../api/indexPolicy";
import { softenMetaText } from "../api/metaText";

const DIST = path.resolve(process.cwd(), "dist");
const BASE_URL = "https://runmania.kr";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

interface RouteConfig {
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  /** JS 번들 로드 전에 시작할 API 요청 (글 상세 LCP 단축) */
  preloadApi?: string;
}

const NOINDEX_META = '<meta name="robots" content="noindex, follow" />';

type DbPostRow = {
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  tags?: unknown;
  published_at?: unknown;
  updated_at?: unknown;
  faq?: unknown;
  generation_meta?: unknown;
};

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
    path: "/about",
    title: "런닝화매니아 소개 | 러닝화 추천·발 진단 플랫폼",
    description:
      "런닝화매니아는 한국 러너를 위한 러닝화 추천, 무료 발 진단, 러닝화 리뷰 전문 플랫폼입니다. 발볼·아치·통증 신호를 기반으로 객관적인 신발 추천 정보를 제공합니다.",
    keywords: "런닝화매니아 소개, 러닝화 추천, 발 진단, 러닝화 리뷰",
  },
  {
    path: "/methodology",
    title: "진단 방법 | 런닝화매니아",
    description:
      "무료 발 진단이 7문항 답변을 어떻게 점수로 바꿔 러닝화를 추천하는지, 제외 규칙과 가산 점수, 러너 유형 기준, 도구 공식과 한계를 공개합니다.",
    keywords: "러닝화 진단 방법, 러닝화 추천 기준, 발 진단 알고리즘",
  },
  {
    path: "/contact",
    title: "문의하기 | 런닝화매니아",
    description:
      "런닝화매니아에 콘텐츠 오류 제보, 제휴 문의, 개인정보 관련 요청, 러닝화 추천 피드백을 보내실 수 있습니다.",
    keywords: "런닝화매니아 문의, 러닝화 추천 문의, contact@runmania.kr",
  },
  {
    path: "/privacy",
    title: "개인정보처리방침 | 런닝화매니아",
    description:
      "런닝화매니아의 개인정보처리방침입니다. 수집 정보, 이용 목적, 제3자 제공, 쿠키 정책 등을 안내합니다.",
    keywords: "런닝화매니아 개인정보처리방침, 쿠키 정책, 광고 쿠키",
  },
  {
    path: "/terms",
    title: "이용약관 | 런닝화매니아",
    description:
      "런닝화매니아 이용약관: 교육 목적의 콘텐츠, 제품 정보, 광고·제휴 고지, AI 활용 고지, 문의처를 안내합니다.",
    keywords: "런닝화매니아 이용약관, 광고 고지, 제휴 링크",
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
  const jsonLd = route.jsonLd ?? buildJsonLd(route, canonical);

  const baseWithCanonical = /<link rel="canonical"[^>]*>/.test(html)
    ? html
    : html.replace("</head>", '    <link rel="canonical" href="" />\n</head>');

  return baseWithCanonical
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
      /<meta property="og:type"[^>]*>/,
      `<meta property="og:type" content="${route.ogType ?? "website"}" />`,
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
    )
    .replace(
      /<\/head>/,
      `${route.noindex ? `${NOINDEX_META}\n` : ""}${route.preloadApi ? `<link rel="preload" as="fetch" href="${route.preloadApi}" crossorigin="anonymous" />\n` : ""}<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`,
    );
}

function buildJsonLd(route: RouteConfig, canonical: string) {
  const base = {
    "@context": "https://schema.org",
    name: route.title.replace(" | 런닝화매니아", ""),
    description: route.description,
    url: canonical,
    inLanguage: "ko-KR",
    isPartOf: {
      "@type": "WebSite",
      name: "런닝화매니아",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "런닝화매니아",
      url: BASE_URL,
      logo: DEFAULT_OG_IMAGE,
    },
  };

  if (route.path.startsWith("/tools/")) {
    return {
      ...base,
      "@type": "WebApplication",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
    };
  }

  if (route.path === "/blog") return { ...base, "@type": "CollectionPage" };
  if (route.path === "/reviews") return { ...base, "@type": "CollectionPage" };
  return { ...base, "@type": route.path === "/" ? "WebSite" : "WebPage" };
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

/**
 * JS 실행 전 초기 HTML에 들어가는 최소 셸.
 * 실제 화면(React)과 같은 정보만 담는다: 제목, 요약, 주요 링크.
 * (크롤러 전용 보일러플레이트 텍스트는 클로킹으로 오해받을 수 있어 넣지 않는다.)
 */
function renderRouteShell(route: RouteConfig) {
  return `<main class="prerender-shell">
  <h1>${escapeHtml(route.title)}</h1>
  <p>${escapeHtml(route.description)}</p>
  <nav aria-label="사이트 메뉴">
    <a href="/tools/diagnosis/">무료 발 진단</a>
    <a href="/reviews/">러닝화 리뷰</a>
    <a href="/blog/">블로그</a>
    <a href="/tools/">러닝 도구</a>
    <a href="/about/">소개</a>
    <a href="/methodology/">진단 방법</a>
    <a href="/contact/">문의</a>
    <a href="/privacy/">개인정보처리방침</a>
    <a href="/terms/">이용약관</a>
  </nav>
</main>`;
}

function isReaderDetailRoute(route: RouteConfig) {
  return /^\/blog\/[^/]+$/.test(route.path);
}

function applyAdsenseRoutePolicy(html: string, route: RouteConfig) {
  if (isReaderDetailRoute(route)) return html;

  return html.replace(
    /\s*<script\s+async\s+src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-3050601904412736"\s+crossorigin="anonymous"\s*><\/script>/,
    "",
  );
}

function writeRouteHtml(baseHtml: string, route: RouteConfig) {
  const html = applyAdsenseRoutePolicy(
    injectMeta(baseHtml, route),
    route,
  ).replace(
    '<div id="root"></div>',
    `<div id="root">${renderRouteShell(route)}</div>`,
  );
  const routePath = route.path === "/" ? "" : route.path;
  const dir = path.join(DIST, routePath);
  ensureDir(dir);
  const outFile = path.join(dir, "index.html");
  fs.writeFileSync(outFile, html, "utf-8");
  console.log(`✅ ${route.path} → dist${routePath}/index.html`);
}

function loadLocalEnv() {
  const values: Record<string, string> = {};
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(envPath)) continue;

    for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex < 0) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed
        .slice(eqIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      values[key] = value;
    }
  }
  return values;
}

function getEnvValue(localEnv: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = process.env[key] || localEnv[key];
    if (value) return value.trim();
  }
  return "";
}

function fixTursoUrl(url: string) {
  return url.startsWith("libsql://")
    ? url.replace("libsql://", "https://")
    : url;
}

function tryParseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeStringArray(value: unknown) {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeFaq(value: unknown) {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const question = String(source.question ?? "").trim();
      const answer = String(source.answer ?? "").trim();
      return question && answer
        ? {
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          }
        : null;
    })
    .filter(Boolean);
}

function normalizeBlogRoute(row: DbPostRow): RouteConfig | null {
  const slug = String(row.slug ?? "").trim();
  const title = softenMetaText(String(row.title ?? "").trim());
  if (!slug || !title) return null;

  const generationMeta = tryParseJson(row.generation_meta) as Record<
    string,
    unknown
  > | null;
  const description = softenMetaText(
    String(generationMeta?.metaDescription ?? "").trim() ||
      String(row.excerpt ?? "").trim() ||
      `${title}에 대한 러닝화 선택 기준과 실전 체크포인트를 정리했습니다.`,
  );
  const tags = normalizeStringArray(row.tags);
  const canonical = `${BASE_URL}/blog/${slug}`;
  const publishedAt = String(row.published_at ?? "").trim();
  const updatedAt = String(row.updated_at ?? row.published_at ?? "").trim();
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: DEFAULT_OG_IMAGE,
    datePublished: publishedAt || undefined,
    dateModified: updatedAt || publishedAt || undefined,
    inLanguage: "ko-KR",
    author: { "@type": "Organization", name: "런닝화매니아", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "런닝화매니아",
      logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    keywords: tags.join(", "),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: `${BASE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: title, item: canonical },
    ],
  };
  const faqItems = normalizeFaq(row.faq);
  const faqLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems,
        }
      : null;

  return {
    path: `/blog/${slug}`,
    title:
      softenMetaText(String(generationMeta?.metaTitle ?? "").trim()) ||
      `${title} | 런닝화매니아`,
    description,
    keywords: tags.join(", "),
    ogType: "article",
    jsonLd: [articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])],
    noindex: isNoindexPost(slug),
    preloadApi: `/api/posts?slug=${encodeURIComponent(slug)}`,
  };
}

async function loadPublishedBlogRoutes() {
  const localEnv = loadLocalEnv();
  const databaseUrl = getEnvValue(localEnv, [
    "TURSO_DATABASE_URL",
    "turso url",
  ]);
  const authToken = getEnvValue(localEnv, ["TURSO_AUTH_TOKEN", "turso token"]);

  if (!databaseUrl || !authToken) {
    console.warn("⚠️ Blog detail prerender skipped: Turso env not configured");
    return [];
  }

  const db = createClient({
    url: fixTursoUrl(databaseUrl),
    authToken,
  });
  const result = await db.execute(`
    SELECT slug, title, excerpt, tags, published_at, updated_at, faq, generation_meta
    FROM blog_posts
    WHERE status = 'published' AND workflow_status = 'approved'
    ORDER BY published_at DESC
  `);

  return result.rows
    .map((row) => normalizeBlogRoute(row as DbPostRow))
    .filter((route): route is RouteConfig => route !== null);
}

async function main() {
  const indexHtml = path.join(DIST, "index.html");
  if (!fs.existsSync(indexHtml)) {
    console.error("❌ dist/index.html not found. Run vite build first.");
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtml, "utf-8");
  const blogRoutes = await loadPublishedBlogRoutes();
  const routes = [...ROUTES, ...blogRoutes];
  console.log(`🚀 Prerendering ${routes.length} routes...\n`);

  // deduplicate routes
  const seen = new Set<string>();
  for (const route of routes) {
    if (seen.has(route.path)) continue;
    seen.add(route.path);
    writeRouteHtml(baseHtml, route);
  }

  console.log("\n✅ Prerender complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
