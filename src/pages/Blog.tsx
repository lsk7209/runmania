import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Tag,
  List,
  CheckCircle2,
  TrendingUp,
  Share2,
  Link as LinkIcon,
  Info,
  AlertTriangle,
  Lightbulb,
  Quote,
  Swords,
  HelpCircle,
} from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

import type { BlogPost } from "@/data/blogPostUtils";
import { mapDbPostToLocal } from "@/data/blogPostUtils";

const BLOG_LIST_QUERY_KEY = ["blog-post-list"];
const BLOG_POST_QUERY_KEY = "blog-post";
const BLOG_CACHE_MS = 5 * 60 * 1000;

const loadLocalPosts = async () => {
  const { LOCAL_POSTS } = await import("@/data/localBlogPosts");
  return LOCAL_POSTS;
};

type BlogListQueryResult = {
  posts: BlogPost[];
  fallbackMessage: string | null;
};

type BlogPostQueryResult = {
  post: BlogPost | null;
  fallbackMessage: string | null;
};

const fetchBlogListPosts = async (): Promise<BlogListQueryResult> => {
  try {
    const response = await fetch("/api/posts");
    if (!response.ok)
      throw new Error(`Blog list request failed: ${response.status}`);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return { posts: data.map(mapDbPostToLocal), fallbackMessage: null };
    }

    return {
      posts: await loadLocalPosts(),
      fallbackMessage:
        "라이브 게시글이 비어 있어 로컬 백업 콘텐츠를 표시 중입니다.",
    };
  } catch (error) {
    console.error("[Blog] Failed to load live post list:", error);
    return {
      posts: await loadLocalPosts(),
      fallbackMessage:
        "라이브 게시글을 불러오지 못해 로컬 백업 콘텐츠를 표시 중입니다.",
    };
  }
};

const fetchBlogPost = async (slug: string): Promise<BlogPostQueryResult> => {
  const localPosts = await loadLocalPosts();
  const fallbackPost =
    localPosts.find((candidate) => candidate.slug === slug) ?? null;

  try {
    const response = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`);
    if (response.status === 404) {
      return {
        post: fallbackPost,
        fallbackMessage: fallbackPost
          ? "라이브 포스트를 찾지 못해 로컬 백업 콘텐츠를 표시 중입니다."
          : null,
      };
    }

    if (!response.ok)
      throw new Error(`Blog detail request failed: ${response.status}`);
    const data = await response.json();
    return {
      post: data ? mapDbPostToLocal(data) : null,
      fallbackMessage: null,
    };
  } catch (error) {
    console.error(`[Blog] Failed to load live post for slug=${slug}:`, error);
    return {
      post: fallbackPost,
      fallbackMessage: fallbackPost
        ? "라이브 포스트를 불러오지 못해 로컬 백업 콘텐츠를 표시 중입니다."
        : "라이브 포스트를 불러오지 못했습니다.",
    };
  }
};

/* ─── Custom Hooks: Fetch posts from DB with local fallback ─── */

const useBlogListPosts = () => {
  const query = useQuery({
    queryKey: BLOG_LIST_QUERY_KEY,
    queryFn: fetchBlogListPosts,
    staleTime: BLOG_CACHE_MS,
    gcTime: BLOG_CACHE_MS * 2,
  });

  return {
    posts: query.data?.posts ?? [],
    loading: query.isLoading,
    fallbackMessage: query.data?.fallbackMessage ?? null,
  };
};

const useBlogPost = (slug: string) => {
  const query = useQuery({
    queryKey: [BLOG_POST_QUERY_KEY, slug],
    queryFn: () => fetchBlogPost(slug),
    staleTime: BLOG_CACHE_MS,
    gcTime: BLOG_CACHE_MS * 2,
  });

  return {
    post: query.data?.post ?? null,
    loading: query.isLoading,
    fallbackMessage: query.data?.fallbackMessage ?? null,
  };
};

/* ─── Category Filter ─── */

type CategoryKey = "all" | "pain" | "body" | "compare" | "tips";

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pain", label: "통증/부상" },
  { key: "body", label: "발유형/체형" },
  { key: "compare", label: "브랜드 비교" },
  { key: "tips", label: "러닝 실전" },
];

const POST_CATEGORY: Record<string, CategoryKey> = {
  "knee-pain-running-shoes": "pain",
  "plantar-fasciitis-shoes": "pain",
  "shin-splints-running-shoes": "pain",
  "achilles-tendon-shoes": "pain",
  "hip-pain-running-shoes": "pain",
  "flat-foot-stability": "body",
  "wide-foot-running-shoes": "body",
  "overweight-running-shoes": "body",
  "high-arch-running-shoes": "body",
  "supination-running-shoes": "body",
  "women-running-shoes": "body",
  "nike-vs-newbalance": "compare",
  "hoka-vs-asics": "compare",
  "brooks-vs-saucony": "compare",
  "best-running-shoes-2025": "tips",
  "beginner-running-shoe-guide": "tips",
  "running-shoe-lifespan": "tips",
  "treadmill-vs-outdoor-shoes": "tips",
  "running-shoe-stack-height": "tips",
  "break-in-running-shoes": "tips",
};

const DataFallbackNotice = ({ message }: { message: string }) => (
  <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-900">
    <div className="flex items-start gap-2">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p>{message}</p>
    </div>
  </div>
);

/* ─── Blog List ─── */

const BlogList = () => {
  usePageMeta({
    title: "러닝화 블로그 | 런닝화매니아",
    description:
      "발 건강과 러닝화에 대한 깊이 있는 분석. 초보 가이드, 부상 예방, 브랜드 비교까지.",
    canonicalPath: "/blog",
    keywords: "러닝화 블로그, 러닝화 추천, 발 건강, 러닝 부상 예방",
  });
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const { posts, loading, fallbackMessage } = useBlogListPosts();
  const queryClient = useQueryClient();

  const prefetchPost = useCallback(
    (slug: string) => {
      void queryClient.prefetchQuery({
        queryKey: [BLOG_POST_QUERY_KEY, slug],
        queryFn: () => fetchBlogPost(slug),
        staleTime: BLOG_CACHE_MS,
      });
    },
    [queryClient],
  );

  // ItemList JSON-LD for blog listing
  useEffect(() => {
    if (posts.length === 0) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "러닝화 블로그 | 런닝화매니아",
      description: "발 건강과 러닝화에 대한 깊이 있는 분석",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: posts.map((post, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${window.location.origin}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    script.id = "bloglist-jsonld";
    document.head.appendChild(script);
    return () => {
      document.getElementById("bloglist-jsonld")?.remove();
    };
  }, [posts]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 pt-24">
        <p className="text-center text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => POST_CATEGORY[p.slug] === activeCategory);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-3xl font-bold">블로그</h1>
        <p className="mb-4 text-muted-foreground">
          발 건강과 러닝화에 대한 깊이 있는 분석
        </p>
        {fallbackMessage ? (
          <DataFallbackNotice message={fallbackMessage} />
        ) : null}

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {cat.label}
              {cat.key !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {
                    posts.filter((p) => POST_CATEGORY[p.slug] === cat.key)
                      .length
                  }
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-4">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/blog/${post.slug}`}
              onMouseEnter={() => prefetchPost(post.slug)}
              onFocus={() => prefetchPost(post.slug)}
            >
              <article className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:card-glow">
                <img
                  src={post.heroImage}
                  alt={post.title}
                  className="hidden sm:block h-24 w-24 shrink-0 rounded-xl object-contain bg-secondary/30"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span>{post.date}</span>
                  </div>
                  <h2 className="mb-1.5 text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
        {filteredPosts.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            해당 카테고리의 글이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

/* ─── Table of Contents ─── */

const TableOfContents = ({ content }: { content: string[] }) => {
  const [open, setOpen] = useState(true);
  const headings = content
    .map((p, i) =>
      p.startsWith("## ")
        ? { title: p.replace("## ", ""), id: `section-${i}` }
        : null,
    )
    .filter(Boolean) as { title: string; id: string }[];

  if (headings.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-bold transition-colors hover:bg-secondary/50"
      >
        <span className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          목차
        </span>
        <span className="text-xs text-muted-foreground">
          {open ? "접기" : "펼치기"}
        </span>
      </button>
      {open && (
        <nav className="border-t border-border px-5 py-3">
          <ol className="space-y-1.5">
            {headings.map((h, i) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className="flex items-baseline gap-2 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <span className="text-[10px] font-mono text-primary">
                    {i + 1}
                  </span>
                  {h.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
};

/* ─── useDocumentMeta ─── */

const useDocumentMeta = (title: string, description: string) => {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');

    document.title = title;
    metaDesc?.setAttribute("content", description);
    ogTitle?.setAttribute("content", title);
    ogDesc?.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute("content", prevDesc);
      ogTitle?.setAttribute("content", prevTitle);
      ogDesc?.setAttribute("content", prevDesc);
    };
  }, [title, description]);
};

/* ─── Reading Progress Bar ─── */

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0,
      );
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary/30">
      <div
        className="h-full bg-primary transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/* ─── Social Share ─── */

const SocialShare = ({ title, slug }: { title: string; slug: string }) => {
  const [copied, setCopied] = useState(false);
  const url = `https://runmania.kr/blog/${slug}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  const shareKakao = () =>
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
      "_blank",
    );
  const shareTwitter = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  const shareFacebook = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
    );

  return (
    <div className="mt-8 flex items-center gap-3">
      <span className="text-xs text-muted-foreground">공유하기</span>
      <button
        onClick={handleCopy}
        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="링크 복사"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        onClick={shareTwitter}
        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="X(트위터) 공유"
      >
        <span className="text-xs font-bold leading-none">𝕏</span>
      </button>
      <button
        onClick={shareFacebook}
        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="페이스북 공유"
      >
        <span className="text-xs font-bold leading-none">f</span>
      </button>
      <button
        onClick={shareKakao}
        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="카카오스토리 공유"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {copied && (
        <span className="text-xs text-primary">링크가 복사되었습니다!</span>
      )}
    </div>
  );
};

/* ─── Blog Detail ─── */

const BlogDetail = ({ slug }: { slug: string }) => {
  const { posts: relatedPosts } = useBlogListPosts();
  const { post, loading, fallbackMessage } = useBlogPost(slug);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const seoTitle =
    post?.generationMeta?.metaTitle ||
    (post ? `${post.title} | 런닝화매니아` : "블로그 | 런닝화매니아");
  const seoDescription =
    post?.generationMeta?.metaDescription ||
    (post ? post.excerpt : "발 건강과 러닝화에 대한 깊이 있는 분석");

  // 조회수 증가 + 표시 (sessionStorage 기반 중복 방지)
  useEffect(() => {
    if (!post?.slug) return;
    const key = `viewed_${post.slug}`;
    const increment = !sessionStorage.getItem(key);
    const method = increment ? "POST" : "GET";
    if (increment) sessionStorage.setItem(key, "1");
    fetch(`/api/views?slug=${encodeURIComponent(post.slug)}`, { method })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setViewCount(data.count);
      })
      .catch(() => {});
  }, [post?.slug]);

  useDocumentMeta(seoTitle, seoDescription);

  // Canonical + JSON-LD (Article + Breadcrumb + FAQ)
  useEffect(() => {
    if (!post) return;

    // Canonical tag
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = `https://runmania.kr/blog/${post.slug}`;
    canonical.id = "blog-canonical";
    document.head.appendChild(canonical);

    // Article JSON-LD
    const articleLd = post.generationMeta?.schemaJson || {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: seoDescription,
      image: `${window.location.origin}${post.heroImage}`,
      datePublished: post.date,
      dateModified: post.dateModified || post.date,
      author: {
        "@type": "Organization",
        name: "런닝화매니아",
        url: window.location.origin,
      },
      publisher: {
        "@type": "Organization",
        name: "런닝화매니아",
        logo: {
          "@type": "ImageObject",
          url: `${window.location.origin}/favicon.ico`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://runmania.kr/blog/${post.slug}`,
      },
      keywords: post.tags.join(", "),
    };

    // Breadcrumb JSON-LD
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "홈",
          item: "https://runmania.kr/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "블로그",
          item: "https://runmania.kr/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `https://runmania.kr/blog/${post.slug}`,
        },
      ],
    };

    // FAQ JSON-LD from explicit FAQ data
    const faqItems = post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    }));

    const faqLd =
      faqItems.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems,
          }
        : null;

    const allLd = [articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])];
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(allLd);
    script.id = "blog-jsonld";
    document.head.appendChild(script);

    return () => {
      document.getElementById("blog-jsonld")?.remove();
      document.getElementById("blog-canonical")?.remove();
    };
  }, [post, seoDescription]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14">
        <p className="text-muted-foreground">
          {fallbackMessage ?? "포스트를 찾을 수 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-2xl px-4 py-16 pt-24">
        {fallbackMessage ? (
          <DataFallbackNotice message={fallbackMessage} />
        ) : null}
        {/* Breadcrumb */}
        <nav
          className="mb-6 text-xs text-muted-foreground"
          aria-label="breadcrumb"
        >
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground">
                홈
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/blog" className="hover:text-foreground">
                블로그
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground line-clamp-1">{post.title}</li>
          </ol>
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Hero Image */}
          <div className="mb-6 flex justify-center rounded-2xl bg-secondary/30 p-6">
            <img
              src={post.heroImage}
              alt={post.title}
              className="h-40 object-contain sm:h-52"
            />
          </div>

          <div className="mb-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime} 읽기</span>
            {viewCount !== null && (
              <>
                <span>·</span>
                <span>조회 {viewCount.toLocaleString()}회</span>
              </>
            )}
          </div>

          <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{post.title}</h1>

          <div className="mb-8 flex gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <TableOfContents content={post.content} />

          <div className="prose-custom space-y-4">
            {post.content.map((paragraph, i) => renderContent(paragraph, i))}
          </div>

          {/* Social Share */}
          <SocialShare title={post.title} slug={post.slug} />

          {/* Q&A Section */}
          {post.faq.length > 0 && (
            <section className="mt-12">
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">자주 묻는 질문</h2>
              </div>
              <Accordion
                type="multiple"
                className="rounded-xl border border-border"
              >
                {post.faq.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="border-border px-4"
                  >
                    <AccordionTrigger className="text-sm font-medium text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Related Posts */}
          <RelatedPosts currentSlug={slug} posts={relatedPosts} />

          {/* CTA at end */}
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="mb-3 text-sm font-medium">
              내 발에 맞는 신발이 궁금하다면?
            </p>
            <Link to="/tools/diagnosis">
              <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground neon-border">
                무료 진단 받기 →
              </button>
            </Link>
          </div>
        </motion.article>
      </div>
    </>
  );
};

const Blog = () => {
  const { slug } = useParams();
  return slug ? <BlogDetail slug={slug} /> : <BlogList />;
};

export default Blog;
