import nb1080 from "@/assets/shoes/nb-1080.png";
import nbMore from "@/assets/shoes/nb-more.png";
import asicsKayano from "@/assets/shoes/asics-kayano.png";
import hokaBondi from "@/assets/shoes/hoka-bondi.png";
import nikePegasus from "@/assets/shoes/nike-pegasus.png";
import sauconySpeed from "@/assets/shoes/saucony-speed.png";

const HERO_IMAGE_MAP: Record<string, string> = {
  "/assets/shoes/nb-1080.png": nb1080,
  "/assets/shoes/nb-more.png": nbMore,
  "/assets/shoes/asics-kayano.png": asicsKayano,
  "/assets/shoes/hoka-bondi.png": hokaBondi,
  "/assets/shoes/nike-pegasus.png": nikePegasus,
  "/assets/shoes/saucony-speed.png": sauconySpeed,
};

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlogSeoSnapshot {
  metaTitle?: string;
  metaDescription?: string;
  schemaJson?: Record<string, unknown>;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  readTime: string;
  date: string;
  dateModified: string;
  heroImage: string;
  relatedSlugs: string[];
  faq: FaqItem[];
  generationMeta?: BlogSeoSnapshot;
}

type DbBlogPost = {
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: unknown;
  tags?: unknown;
  read_time?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  hero_image?: string | null;
  related_slugs?: unknown;
  faq?: unknown;
  generation_meta?: unknown;
};

export const mapDbPostToLocal = (dbPost: DbBlogPost): BlogPost => {
  const heroImagePath = dbPost.hero_image || "";

  return {
    slug: dbPost.slug || "",
    title: dbPost.title || "",
    excerpt: dbPost.excerpt || "",
    content: normalizeStringArray(dbPost.content),
    tags: normalizeStringArray(dbPost.tags),
    readTime: dbPost.read_time || "10분",
    date: splitIsoDate(dbPost.published_at) || splitIsoDate(dbPost.created_at) || "",
    dateModified: splitIsoDate(dbPost.updated_at) || "",
    heroImage: HERO_IMAGE_MAP[heroImagePath] || heroImagePath || nb1080,
    relatedSlugs: normalizeStringArray(dbPost.related_slugs),
    faq: normalizeFaqItems(dbPost.faq),
    generationMeta: normalizeGenerationMeta(dbPost.generation_meta),
  };
};

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeFaqItems(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const question = String((item as FaqItem).question ?? "").trim();
      const answer = String((item as FaqItem).answer ?? "").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is FaqItem => item !== null);
}

function splitIsoDate(value: string | null | undefined) {
  return value ? value.split("T")[0] : "";
}

function normalizeGenerationMeta(value: unknown): BlogSeoSnapshot | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;

  const source = value as Record<string, unknown>;
  const schemaJson =
    typeof source.schemaJson === "object" && source.schemaJson !== null && !Array.isArray(source.schemaJson)
      ? (source.schemaJson as Record<string, unknown>)
      : undefined;

  return {
    metaTitle: typeof source.metaTitle === "string" ? source.metaTitle : undefined,
    metaDescription: typeof source.metaDescription === "string" ? source.metaDescription : undefined,
    schemaJson,
  };
}
