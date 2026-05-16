import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Footprints, ArrowRight, Activity, BookOpen, Star, Zap,
  AlertTriangle, Shield, Ruler, CheckCircle2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageMeta from "@/hooks/usePageMeta";
import { trackEvent } from "@/lib/analytics";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const toolCards = [
  {
    icon: <Footprints className="h-6 w-6" />,
    title: "러닝화 처방 진단",
    description: "7개 질문으로 내 발에 맞는 신발과 절대 신으면 안 되는 신발을 분석합니다.",
    link: "/tools/diagnosis",
    cta: "진단 시작하기",
    badge: "인기",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "러닝 페이스 계산기",
    description: "페이스 → 완주 시간, 목표 시간 → 필요 페이스를 즉시 계산합니다.",
    link: "/tools/pace-calculator",
    cta: "계산하기",
    badge: "NEW",
  },
  {
    icon: <Ruler className="h-6 w-6" />,
    title: "발 사이즈 변환기",
    description: "한국(mm) · US · EU · UK 사이즈를 즉시 상호 변환합니다.",
    link: "/tools/size-converter",
    cta: "변환하기",
    badge: "NEW",
  },
];

type HomeBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
};

const FALLBACK_BLOG_POSTS: HomeBlogPost[] = [
  {
    slug: "best-running-shoes-2025",
    title: "2025 러닝화 추천 TOP 5: 용도별 최고의 선택",
    excerpt: "2025년 최고의 러닝화를 용도별로 엄선. 쿠셔닝, 안정성, 레이스용까지 한눈에 비교합니다.",
    tags: ["2025 추천", "러닝화 비교"],
    readTime: "10분",
  },
  {
    slug: "beginner-running-shoe-guide",
    title: "러닝 초보 신발 추천: 입문자가 첫 러닝화를 고르는 완벽 가이드",
    excerpt: "러닝을 처음 시작하는 분을 위한 러닝화 선택 기준 A to Z. 쿠셔닝, 안정성, 발볼까지.",
    tags: ["러닝 초보", "신발 추천"],
    readTime: "10분",
  },
  {
    slug: "knee-pain-running-shoes",
    title: "무릎 아플 때 러닝화 선택법",
    excerpt: "러닝 후 무릎이 아프다면 신발이 원인일 수 있습니다. 무릎 보호에 최적화된 러닝화 추천.",
    tags: ["무릎 통증", "러닝화 추천"],
    readTime: "9분",
  },
];

const reviewHighlights = [
  {
    slug: "아식스-젤카야노-30",
    name: "아식스 젤카야노 30",
    rating: 4.5,
    oneLiner: "편평족의 구원자. 안정성 최강.",
    tag: "안정화",
  },
  {
    slug: "뉴발란스-프레시폼-1080-v13-2e",
    name: "뉴발란스 1080 v13",
    rating: 4.3,
    oneLiner: "넓은 발볼 + 푹신한 쿠셔닝의 정석.",
    tag: "쿠셔닝",
  },
  {
    slug: "호카-본디-8",
    name: "호카 본디 8",
    rating: 4.4,
    oneLiner: "무릎 보호 맥시멀 쿠셔닝.",
    tag: "맥스쿠션",
  },
];

const selectionGuide = [
  {
    title: "발볼",
    description: "새끼발가락 압박, 갑피 터짐, 발등 통증이 잦다면 2E·4E 라스트를 먼저 확인합니다.",
  },
  {
    title: "아치",
    description: "평발·과내전은 안정화, 요족·과외전은 충격 흡수와 중립 쿠션을 우선 비교합니다.",
  },
  {
    title: "러닝 목적",
    description: "입문·조깅·장거리·대회용을 분리하면 불필요한 카본화나 과한 쿠션 선택을 줄일 수 있습니다.",
  },
  {
    title: "부상 신호",
    description: "무릎, 정강이, 족저근막 통증은 신발만이 아니라 훈련량과 회복까지 함께 점검합니다.",
  },
];

const faqItems = [
  {
    question: "러닝화 추천은 어떤 기준으로 보나요?",
    answer: "발볼, 아치, 체중, 주간 거리, 러닝 목적, 통증 이력을 함께 봅니다. 브랜드 순위보다 내 발과 훈련 조건에 맞는지를 먼저 판단합니다.",
  },
  {
    question: "무료 발 진단 결과만 믿어도 되나요?",
    answer: "진단은 구매 전 후보를 좁히는 도구입니다. 실제 착화감, 매장 피팅, 통증 지속 여부는 별도로 확인해야 합니다.",
  },
  {
    question: "광고나 제휴가 추천에 영향을 주나요?",
    answer: "광고가 표시될 수 있지만, 추천 기준은 발 특성과 러닝 목적을 우선합니다. 상업적 링크가 들어가는 경우 독자가 알 수 있게 표시합니다.",
  },
];

const Home = () => {
  const [blogPosts, setBlogPosts] = useState<HomeBlogPost[]>(FALLBACK_BLOG_POSTS);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const recent = data.slice(0, 3).map((p: Record<string, unknown>) => ({
            slug: String(p.slug ?? ""),
            title: String(p.title ?? ""),
            excerpt: String(p.excerpt ?? ""),
            tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
            readTime: String(p.read_time ?? "10분"),
          }));
          setBlogPosts(recent);
        }
      })
      .catch(() => {});
  }, []);

  usePageMeta({
    title: "러닝화 추천 | 발 유형별 무료 진단 | 런닝화매니아",
    description: "초보 러닝화 추천, 무릎 통증·족저근막염·발볼 넓은 러닝화 가이드. 3분 무료 발 진단으로 내 발 유형에 맞는 신발과 피해야 할 신발을 바로 확인하세요.",
    canonicalPath: "/",
    keywords: "러닝화 추천, 초보 러닝화, 입문 러닝화, 무릎 통증 러닝화, 족저근막염 신발, 발볼 넓은 러닝화, 편평족 러닝화, 발 진단",
  });

  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "런닝화매니아",
          "url": "https://www.runmania.kr",
          "description": "러닝화 추천, 무료 발 진단, 러닝 초보 신발, 무릎 통증 러닝화, 족저근막염 신발 가이드.",
          "inLanguage": "ko",
        },
        {
          "@type": "Organization",
          "name": "런닝화매니아",
          "url": "https://www.runmania.kr",
          "logo": "https://www.runmania.kr/og-image.png",
        },
        {
          "@type": "FAQPage",
          "mainEntity": faqItems.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer,
            },
          })),
        },
      ],
    };
    const scriptId = "home-jsonld";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, []);

  return (
    <main className="min-h-screen pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="scan-line pointer-events-none absolute inset-0 z-0" />
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(160 84% 39%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
            <Activity className="h-3 w-3 text-primary" />
            러닝화 분석 플랫폼
          </div>

          <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            러닝화 추천, 내 발에 맞는 신발
            <br />
            <span className="neon-text text-primary">데이터</span>로 찾아드립니다.
          </h1>

          <p className="mx-auto mb-8 max-w-md text-base text-muted-foreground sm:text-lg">
            발볼, 아치, 통증 신호, 러닝 목적을 함께 보고
            <br />
            초보 러너가 피해야 할 신발까지 정리합니다.
          </p>

          {/* 신뢰 통계 */}
          <div className="mx-auto mb-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="font-bold text-primary">30+</span> 러닝화 분석</span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1"><span className="font-bold text-primary">6</span> 러너 유형</span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1"><span className="font-bold text-primary">3분</span> 무료 진단</span>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/tools/diagnosis"
              onClick={() => trackEvent("cta_clicked", { location: "home_hero", target: "diagnosis" })}
            >
              <Button
                size="lg"
                className="group gap-2 rounded-xl bg-primary px-8 py-6 text-base font-semibold text-primary-foreground neon-border transition-all hover:neon-border-strong"
              >
                무료 발 진단 받기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link
              to="/blog"
              onClick={() => trackEvent("cta_clicked", { location: "home_hero", target: "blog" })}
            >
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-xl border-border px-8 py-6 text-base hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4" />
                블로그 보기
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Tools Section */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold">진단 도구</h2>
            <p className="text-sm text-muted-foreground">내 발 상태를 정밀하게 분석하세요</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolCards.map((card, i) => (
              <motion.div
                key={card.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={card.link}
                  onClick={() => trackEvent("tool_used", { location: "home_tools", tool: card.title })}
                >
                  <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:card-glow">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                        {card.icon}
                      </div>
                      {card.badge && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{card.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{card.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                      {card.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Upcoming tools placeholder */}

          </div>
        </div>
      </section>

      {/* Selection Guide */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mb-10 max-w-2xl">
            <h2 className="mb-3 text-2xl font-bold">러닝화 선택 기준</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              좋은 러닝화는 비싼 모델이 아니라 내 발에서 문제를 만들지 않는 모델입니다. 런닝화매니아는 신발 스펙보다 발 상태와 사용 목적을 먼저 분류합니다.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selectionGuide.map((item, i) => (
              <motion.article
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-lg border border-border bg-card p-5"
              >
                <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 text-base font-bold">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold">블로그</h2>
              <p className="text-sm text-muted-foreground">발 건강과 러닝화에 대한 깊이 있는 분석</p>
            </div>
            <Link to="/blog" className="text-sm text-primary hover:underline">
              전체보기 →
            </Link>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <article className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30">
                    <div className="mb-3 flex items-center gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="mb-2 text-base font-bold leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="text-[11px] text-muted-foreground/60">
                      읽는 시간: {post.readTime}
                    </span>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Highlights */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold">신발 리뷰</h2>
              <p className="text-sm text-muted-foreground">러닝화 상세 분석 및 비교</p>
            </div>
            <Link to="/reviews" className="text-sm text-primary hover:underline">
              전체보기 →
            </Link>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {reviewHighlights.map((review, i) => (
              <motion.div
                key={review.slug}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/reviews/${review.slug}`}>
                  <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {review.tag}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Star className="h-3 w-3 fill-primary" />
                        {review.rating}
                      </div>
                    </div>
                    <h3 className="mb-1 text-sm font-bold group-hover:text-primary transition-colors">
                      {review.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{review.oneLiner}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-border px-4 py-16">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mx-auto max-w-2xl text-center">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10">
            <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-3 text-xl font-bold">
              잘못된 신발이 <span className="text-primary">부상</span>을 만듭니다
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              3분 진단으로 내 발에 맞는 신발을 찾고, 위험한 신발을 피하세요.
            </p>
             <Link
               to="/tools/diagnosis"
               onClick={() => trackEvent("cta_clicked", { location: "home_bottom", target: "diagnosis" })}
             >
              <Button className="gap-2 rounded-xl bg-primary px-8 py-5 text-primary-foreground neon-border">
                <Shield className="h-4 w-4" />
                무료 진단 받기
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trust & FAQ */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              <h2 className="text-xl font-bold">운영 기준</h2>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              이 사이트는 러닝화 구매 전 판단을 돕는 정보형 콘텐츠와 계산 도구를 제공합니다. 의료 진단을 대신하지 않으며, 통증이 지속되면 전문가 상담을 권합니다.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              일부 페이지에는 광고가 표시될 수 있습니다. 광고 배치는 콘텐츠 읽기와 도구 사용을 방해하지 않는 범위로 제한합니다.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-4">
            <h2 className="text-xl font-bold">자주 묻는 질문</h2>
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-lg border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-bold">{item.question}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm">
            <Footprints className="h-4 w-4 text-primary" />
            <span className="font-bold">런닝화매니아</span>
          </div>
          <div className="mb-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">소개</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link>
            <Link to="/blog" className="hover:text-primary transition-colors">블로그</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 런닝화매니아. 러닝화 추천 · 발 진단 플랫폼.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
