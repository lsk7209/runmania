import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Shield,
  Zap,
  Ruler,
  Weight,
  GitCompareArrows,
  X,
  ChevronDown,
  Lightbulb,
  UserCheck,
  UserX,
} from "lucide-react";
import { SHOES_DB, type Shoe } from "@/data/shoesDb";
import { getShoeImage } from "@/data/shoeImages";
import { reviewData } from "@/data/reviewContent";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import usePageMeta from "@/hooks/usePageMeta";

// ─── Compare Bar ─────────────────────────────────────────────
const CompareBar = ({
  selected,
  onRemove,
  onCompare,
}: {
  selected: Shoe[];
  onRemove: (name: string) => void;
  onCompare: () => void;
}) => (
  <AnimatePresence>
    {selected.length > 0 && (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card px-5 py-3 shadow-lg neon-border">
          <GitCompareArrows className="h-4 w-4 text-primary shrink-0" />
          {selected.map((s) => (
            <span
              key={s.name}
              className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium"
            >
              {s.brand} {s.name.split(" ").slice(1, 3).join(" ")}
              <button
                onClick={() => onRemove(s.name)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selected.length < 2 && (
            <span className="text-xs text-muted-foreground">
              1개 더 선택하세요
            </span>
          )}
          {selected.length === 2 && (
            <Button
              size="sm"
              onClick={onCompare}
              className="ml-1 gap-1.5 rounded-lg bg-primary text-xs text-primary-foreground"
            >
              비교하기
            </Button>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Compare View ────────────────────────────────────────────
const DotRating = ({
  value,
  max = 5,
  color = "bg-primary",
}: {
  value: number;
  max?: number;
  color?: string;
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, j) => (
      <div
        key={j}
        className={`h-2 w-2 rounded-full ${j < value ? color : "bg-muted"}`}
      />
    ))}
  </div>
);

const CompareView = ({
  shoes,
  onClose,
}: {
  shoes: [Shoe, Shoe];
  onClose: () => void;
}) => {
  const [a, b] = shoes;
  const reviewA = reviewData[a.name];
  const reviewB = reviewData[b.name];
  const imgA = getShoeImage(a.name);
  const imgB = getShoeImage(b.name);

  const specRows: {
    label: string;
    icon: React.ReactNode;
    getVal: (s: Shoe) => React.ReactNode;
    getBetter?: (s1: Shoe, s2: Shoe) => Shoe | null;
  }[] = [
    {
      label: "쿠셔닝",
      icon: <Zap className="h-3 w-3" />,
      getVal: (s) => <DotRating value={s.cushionLevel} />,
      getBetter: (s1, s2) =>
        s1.cushionLevel > s2.cushionLevel
          ? s1
          : s2.cushionLevel > s1.cushionLevel
            ? s2
            : null,
    },
    {
      label: "안정성",
      icon: <Shield className="h-3 w-3" />,
      getVal: (s) => <DotRating value={s.stabilityLevel} color="bg-accent" />,
      getBetter: (s1, s2) =>
        s1.stabilityLevel > s2.stabilityLevel
          ? s1
          : s2.stabilityLevel > s1.stabilityLevel
            ? s2
            : null,
    },
    {
      label: "무게",
      icon: <Weight className="h-3 w-3" />,
      getVal: (s) => <span className="font-mono">{s.weightGrams}g</span>,
      getBetter: (s1, s2) =>
        s1.weightGrams < s2.weightGrams
          ? s1
          : s2.weightGrams < s1.weightGrams
            ? s2
            : null,
    },
    {
      label: "드롭",
      icon: <Ruler className="h-3 w-3" />,
      getVal: (s) => <span className="font-mono">{s.dropMm}mm</span>,
    },
    {
      label: "발볼",
      icon: null,
      getVal: (s) => <span>{s.widthAvailable.join("/")}</span>,
      getBetter: (s1, s2) =>
        s1.widthAvailable.length > s2.widthAvailable.length
          ? s1
          : s2.widthAvailable.length > s1.widthAvailable.length
            ? s2
            : null,
    },
    {
      label: "가격대",
      icon: null,
      getVal: (s) => <span>{s.priceRange}</span>,
    },
    {
      label: "평점",
      icon: <Star className="h-3 w-3" />,
      getVal: (s) => {
        const r = reviewData[s.name];
        return r ? (
          <span className="font-mono text-primary">{r.rating}</span>
        ) : (
          <span>-</span>
        );
      },
      getBetter: (s1, s2) => {
        const r1 = reviewData[s1.name]?.rating ?? 0;
        const r2 = reviewData[s2.name]?.rating ?? 0;
        return r1 > r2 ? s1 : r2 > r1 ? s2 : null;
      },
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 pt-24">
      <button
        onClick={onClose}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        리뷰 목록으로
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 flex items-center gap-3">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">신발 비교</h1>
        </div>

        {/* Header: images + names */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {[
            { shoe: a, img: imgA },
            { shoe: b, img: imgB },
          ].map(({ shoe, img }) => (
            <div
              key={shoe.name}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              {img && (
                <div className="h-40 overflow-hidden bg-secondary">
                  <img
                    src={img}
                    alt={shoe.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 text-center">
                <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                  {shoe.type}
                </span>
                <h2 className="text-sm font-bold">{shoe.name}</h2>
                <p className="text-[11px] text-muted-foreground">
                  {shoe.brand}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Spec comparison table */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-secondary/50 px-5 py-3">
            <h3 className="text-xs font-bold text-muted-foreground">
              스펙 비교
            </h3>
          </div>
          {specRows.map((row, i) => {
            const better = row.getBetter?.(a, b) ?? null;
            return (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_100px_1fr] items-center gap-2 px-5 py-3 text-xs ${
                  i < specRows.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div
                  className={`text-right ${better === a ? "text-primary font-medium" : ""}`}
                >
                  {row.getVal(a)}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  {row.icon}
                  <span>{row.label}</span>
                </div>
                <div
                  className={`${better === b ? "text-primary font-medium" : ""}`}
                >
                  {row.getVal(b)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pros/Cons side by side */}
        {(reviewA || reviewB) && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[
              { shoe: a, review: reviewA },
              { shoe: b, review: reviewB },
            ].map(({ shoe, review }) => (
              <div key={shoe.name} className="space-y-3">
                {review && (
                  <>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <h4 className="mb-2 text-xs font-bold text-primary">
                        👍 장점
                      </h4>
                      <ul className="space-y-1">
                        {review.pros.map((p) => (
                          <li
                            key={p}
                            className="text-[11px] text-secondary-foreground"
                          >
                            • {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <h4 className="mb-2 text-xs font-bold text-destructive">
                        👎 단점
                      </h4>
                      <ul className="space-y-1">
                        {review.cons.map((c) => (
                          <li
                            key={c}
                            className="text-[11px] text-secondary-foreground"
                          >
                            • {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <p className="text-[11px] text-secondary-foreground">
                        {review.verdict}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            어떤 신발이 내 발에 맞을까?
          </p>
          <Link to="/tools/diagnosis">
            <Button className="gap-2 rounded-xl bg-primary text-primary-foreground neon-border">
              무료 발 진단 받기 →
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Shoe Selector Dropdown ──────────────────────────────────
const ShoeSelector = ({
  selected,
  onSelect,
  exclude,
}: {
  selected: Shoe | null;
  onSelect: (shoe: Shoe) => void;
  exclude?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3 text-sm transition-colors hover:border-primary/30"
      >
        <span className={selected ? "font-medium" : "text-muted-foreground"}>
          {selected ? selected.name : "신발 선택..."}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
          >
            {SHOES_DB.filter((s) => s.name !== exclude).map((shoe) => (
              <button
                key={shoe.name}
                onClick={() => {
                  onSelect(shoe);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
              >
                {getShoeImage(shoe.name) && (
                  <img
                    src={getShoeImage(shoe.name)}
                    alt=""
                    className="h-8 w-12 rounded object-cover"
                  />
                )}
                <div>
                  <p className="text-xs font-medium">{shoe.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {shoe.brand} · {shoe.type}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Review List ─────────────────────────────────────────────
const ReviewList = ({
  compareSelected,
  onToggleCompare,
}: {
  compareSelected: Shoe[];
  onToggleCompare: (shoe: Shoe) => void;
}) => (
  <div className="mx-auto max-w-4xl px-4 py-16 pt-24">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="mb-2 text-3xl font-bold">러닝화 리뷰 비교</h1>
      <p className="mb-4 text-muted-foreground">
        인기 러닝화 10개 모델 상세 분석 및 스펙 비교
      </p>
      <p className="mb-10 text-xs text-muted-foreground">
        <GitCompareArrows className="mr-1 inline h-3 w-3 text-primary" />
        카드를 클릭해 상세 리뷰를, 비교 버튼으로 2개 신발을 나란히 비교하세요.
      </p>
    </motion.div>

    <div className="grid gap-4 sm:grid-cols-2">
      {SHOES_DB.map((shoe, i) => {
        const review = reviewData[shoe.name];
        const img = getShoeImage(shoe.name);
        const slug = shoe.name
          .replace(/\s+/g, "-")
          .replace(/[()]/g, "")
          .toLowerCase();
        const isSelected = compareSelected.some((s) => s.name === shoe.name);

        return (
          <motion.div
            key={shoe.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className={`group overflow-hidden rounded-2xl border bg-card transition-all hover:card-glow ${
                isSelected
                  ? "border-primary neon-border"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Link to={`/reviews/${slug}`}>
                {img && (
                  <div className="h-36 overflow-hidden bg-secondary">
                    <img
                      src={img}
                      alt={`${shoe.name} ${shoe.brand} 러닝화 제품 사진`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5 pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {shoe.type}
                    </span>
                    {review && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Star className="h-3 w-3 fill-primary" />
                        {review.rating}
                      </div>
                    )}
                  </div>
                  <h3 className="mb-1 text-sm font-bold group-hover:text-primary transition-colors">
                    {shoe.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {shoe.description}
                  </p>
                  <div className="mt-3 flex gap-2 text-[10px] text-muted-foreground">
                    <span>{shoe.weightGrams}g</span>
                    <span>·</span>
                    <span>드롭 {shoe.dropMm}mm</span>
                    <span>·</span>
                    <span>{shoe.priceRange}</span>
                  </div>
                </div>
              </Link>
              {/* Compare toggle */}
              <div className="px-5 pb-4 pt-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleCompare(shoe);
                  }}
                  disabled={!isSelected && compareSelected.length >= 2}
                  className={`w-full rounded-lg border py-1.5 text-[11px] font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : compareSelected.length >= 2
                        ? "border-border text-muted-foreground/40 cursor-not-allowed"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <GitCompareArrows className="mr-1 inline h-3 w-3" />
                  {isSelected ? "비교 해제" : "비교 선택"}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

// ─── Review Detail ───────────────────────────────────────────
const ReviewDetail = ({ slug }: { slug: string }) => {
  const shoe = SHOES_DB.find(
    (s) =>
      s.name.replace(/\s+/g, "-").replace(/[()]/g, "").toLowerCase() === slug,
  );

  const review = shoe ? reviewData[shoe.name] : undefined;
  const img = shoe ? getShoeImage(shoe.name) : undefined;

  usePageMeta({
    title: shoe
      ? `${shoe.name} 리뷰 | ${shoe.brand} 러닝화 상세 분석 | 런닝화매니아`
      : "리뷰를 찾을 수 없습니다 | 런닝화매니아",
    description: shoe
      ? `${shoe.name} 상세 리뷰 - ${shoe.description}`
      : "요청하신 러닝화 리뷰를 찾을 수 없습니다.",
    canonicalPath: `/reviews/${slug}`,
    keywords: shoe
      ? `${shoe.name}, ${shoe.brand} 러닝화, 러닝화 리뷰, ${shoe.type}`
      : "러닝화 리뷰",
    image: img,
    imageAlt: shoe ? `${shoe.name} ${shoe.brand} 러닝화` : undefined,
    type: "product",
    noindex: !shoe,
  });

  // Product + Review + AggregateRating JSON-LD (리치 스니펫용)
  useEffect(() => {
    if (!shoe) return;
    const id = "review-jsonld";
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: shoe.name,
      brand: { "@type": "Brand", name: shoe.brand },
      description: shoe.description,
      image: img ?? "https://runmania.kr/og-image.png",
      offers: {
        "@type": "Offer",
        priceCurrency: "KRW",
        availability: "https://schema.org/InStock",
        price: shoe.priceRange.replace(/[^0-9]/g, "") || "0",
      },
      ...(review && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
          reviewCount: 1,
        },
        review: [
          {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
            },
            author: { "@type": "Organization", name: "런닝화매니아" },
            reviewBody: review.verdict,
          },
        ],
      }),
    };
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://runmania.kr/" },
        { "@type": "ListItem", position: 2, name: "리뷰", item: "https://runmania.kr/reviews" },
        {
          "@type": "ListItem",
          position: 3,
          name: shoe.name,
          item: `https://runmania.kr/reviews/${slug}`,
        },
      ],
    };
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify([productLd, breadcrumbLd]);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [shoe, review, img, slug]);

  if (!shoe) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14">
        <p className="text-muted-foreground">리뷰를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 pt-24">
      <Link
        to="/reviews"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        리뷰 목록
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {img && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-border">
            <img
              src={img}
              alt={`${shoe.name} ${shoe.brand} 러닝화 상세 리뷰 사진`}
              className="w-full object-cover"
              width={640}
              height={512}
              loading="eager"
              decoding="async"
            />
          </div>
        )}

        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            {shoe.type}
          </span>
          <span className="text-sm text-muted-foreground">{shoe.brand}</span>
          {review && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <Star className="h-4 w-4 fill-primary" />
              {review.rating} / 5
            </div>
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{shoe.name}</h1>
        <p className="mb-8 text-muted-foreground">{shoe.description}</p>

        {/* Detailed Review */}
        {review?.detailedReview && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold">📝 상세 리뷰</h2>
            {review.detailedReview.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="mb-4 text-sm leading-relaxed text-secondary-foreground last:mb-0"
              >
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Ideal For / Not For */}
        {review &&
          (review.idealFor?.length > 0 || review.notFor?.length > 0) && (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {review.idealFor?.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
                    <UserCheck className="h-4 w-4" />
                    추천 러너
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {review.idealFor.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {review.notFor?.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-destructive">
                    <UserX className="h-4 w-4" />
                    비추천 러너
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {review.notFor.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Specs */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-bold">상세 스펙</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  쿠셔닝
                </span>
                <span className="font-mono text-primary">
                  {shoe.cushionLevel}/5
                </span>
              </div>
              <Progress
                value={(shoe.cushionLevel / 5) * 100}
                className="h-1.5 bg-secondary [&>div]:bg-primary"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  안정성
                </span>
                <span className="font-mono text-primary">
                  {shoe.stabilityLevel}/5
                </span>
              </div>
              <Progress
                value={(shoe.stabilityLevel / 5) * 100}
                className="h-1.5 bg-secondary [&>div]:bg-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">무게</p>
                  <p className="font-mono font-medium">{shoe.weightGrams}g</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">드롭</p>
                  <p className="font-mono font-medium">{shoe.dropMm}mm</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-muted-foreground">발볼 옵션</span>
              <span className="font-medium">
                {shoe.widthAvailable.join(" / ")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">가격대</span>
              <span className="font-medium">{shoe.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Pros / Cons */}
        {review && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-bold text-primary">👍 장점</h3>
                <ul className="space-y-2">
                  {review.pros.map((pro) => (
                    <li key={pro} className="text-xs text-secondary-foreground">
                      • {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-bold text-destructive">
                  👎 단점
                </h3>
                <ul className="space-y-2">
                  {review.cons.map((con) => (
                    <li key={con} className="text-xs text-secondary-foreground">
                      • {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tips */}
            {review.tips?.length > 0 && (
              <div className="mb-4 rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  착용 팁
                </h3>
                <ul className="space-y-2">
                  {review.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-xs leading-relaxed text-secondary-foreground"
                    >
                      💡 {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 text-sm font-bold">📋 총평</h3>
              <p className="text-sm text-secondary-foreground">
                {review.verdict}
              </p>
            </div>

            {/* FAQ */}
            {review.faq?.length > 0 && (
              <div className="mb-8 rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-bold">❓ 자주 묻는 질문</h3>
                <Accordion type="single" collapsible className="w-full">
                  {review.faq.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-xs text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            이 신발이 내 발에 맞을까?
          </p>
          <Link to="/tools/diagnosis">
            <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground neon-border">
              무료 발 진단 받기 →
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Reviews Component ─────────────────────────────────
const Reviews = () => {
  const { slug } = useParams();
  const [compareSelected, setCompareSelected] = useState<Shoe[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  usePageMeta({
    title: "러닝화 리뷰 비교 | 10개 모델 상세 분석 | 런닝화매니아",
    description:
      "아식스 카야노, 뉴발란스 1080, 호카 본디 등 인기 러닝화 10개 모델 상세 리뷰 및 스펙 비교.",
    canonicalPath: "/reviews",
    keywords:
      "러닝화 리뷰, 러닝화 비교, 아식스 카야노, 뉴발란스 1080, 호카 본디",
  });

  const handleToggleCompare = (shoe: Shoe) => {
    setCompareSelected((prev) =>
      prev.some((s) => s.name === shoe.name)
        ? prev.filter((s) => s.name !== shoe.name)
        : prev.length < 2
          ? [...prev, shoe]
          : prev,
    );
  };

  const handleRemove = (name: string) => {
    setCompareSelected((prev) => prev.filter((s) => s.name !== name));
  };

  const handleCompare = () => {
    if (compareSelected.length === 2) setShowCompare(true);
  };

  const handleCloseCompare = () => {
    setShowCompare(false);
    setCompareSelected([]);
  };

  if (slug) return <ReviewDetail slug={slug} />;
  if (showCompare && compareSelected.length === 2) {
    return (
      <CompareView
        shoes={compareSelected as [Shoe, Shoe]}
        onClose={handleCloseCompare}
      />
    );
  }

  return (
    <>
      <ReviewList
        compareSelected={compareSelected}
        onToggleCompare={handleToggleCompare}
      />
      <CompareBar
        selected={compareSelected}
        onRemove={handleRemove}
        onCompare={handleCompare}
      />
    </>
  );
};

export default Reviews;
