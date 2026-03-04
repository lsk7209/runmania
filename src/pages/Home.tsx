import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Footprints, ArrowRight, Activity, BookOpen, Star, Zap,
  AlertTriangle, Shield, TrendingUp, Ruler
} from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageMeta from "@/hooks/usePageMeta";

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
    link: "/diagnosis",
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

const blogPosts = [
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
    slug: "asics-kayano-30",
    name: "아식스 젤카야노 30",
    rating: 4.5,
    oneLiner: "편평족의 구원자. 안정성 최강.",
    tag: "안정화",
  },
  {
    slug: "nb-fresh-foam-1080",
    name: "뉴발란스 1080 v13",
    rating: 4.3,
    oneLiner: "넓은 발볼 + 푹신한 쿠셔닝의 정석.",
    tag: "쿠셔닝",
  },
  {
    slug: "hoka-bondi-8",
    name: "호카 본디 8",
    rating: 4.4,
    oneLiner: "무릎 보호 맥시멀 쿠셔닝.",
    tag: "맥스쿠션",
  },
];

const Home = () => {
  usePageMeta({
    title: "러닝화 추천 | 무료 발 진단 | 런닝화매니아",
    description: "러닝 초보 신발 추천, 무릎 통증 러닝화, 족저근막염 신발, 발볼 넓은 러닝화 추천. 3분 무료 발 진단으로 내 발에 맞는 러닝화를 찾으세요.",
    canonicalPath: "/",
    keywords: "러닝화 추천, 러닝 초보 신발, 무릎 러닝화, 족저근막염 신발, 발볼 넓은 러닝화, 편평족 러닝화",
  });

  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "런닝화매니아",
          "url": "https://runmania.kr",
          "description": "러닝화 추천, 무료 발 진단, 러닝 초보 신발, 무릎 통증 러닝화, 족저근막염 신발 가이드.",
          "inLanguage": "ko",
        },
        {
          "@type": "Organization",
          "name": "런닝화매니아",
          "url": "https://runmania.kr",
          "logo": "https://runmania.kr/og-image.png",
        },
      ],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen pt-14">
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
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

          <p className="mx-auto mb-10 max-w-md text-base text-muted-foreground sm:text-lg">
            발 진단 · 신발 리뷰 · 러닝 가이드까지.
            <br />
            런닝화매니아에서 모두 확인하세요.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/diagnosis">
              <Button
                size="lg"
                className="group gap-2 rounded-xl bg-primary px-8 py-6 text-base font-semibold text-primary-foreground neon-border transition-all hover:neon-border-strong"
              >
                무료 발 진단 받기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/blog">
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
                <Link to={card.link}>
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
            <Link to="/diagnosis">
              <Button className="gap-2 rounded-xl bg-primary px-8 py-5 text-primary-foreground neon-border">
                <Shield className="h-4 w-4" />
                무료 진단 받기
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm">
            <Footprints className="h-4 w-4 text-primary" />
            <span className="font-bold">런닝화매니아</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 런닝화매니아. 러닝화 추천 · 발 진단 플랫폼.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
