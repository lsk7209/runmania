import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}

const BASE_URL = "https://runmania.kr";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const ensureMeta = (selector: string, create: () => HTMLMetaElement) => {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  let created = false;
  if (!el) {
    el = create();
    document.head.appendChild(el);
    created = true;
  }
  return { el, created };
};

const resolveImage = (image?: string) => {
  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return `${BASE_URL}${image}`;
  return DEFAULT_IMAGE;
};

const usePageMeta = ({
  title,
  description,
  canonicalPath,
  keywords,
  image,
  imageAlt,
  type = "website",
  noindex = false,
}: PageMetaOptions) => {
  useEffect(() => {
    const url = `${BASE_URL}${canonicalPath}`;
    const resolvedImage = resolveImage(image);

    // Snapshot of existing values for restoration on unmount.
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    const prevOgTitle = ogTitle?.getAttribute("content") ?? "";
    const prevOgDesc = ogDesc?.getAttribute("content") ?? "";
    const prevOgImage = ogImage?.getAttribute("content") ?? "";
    const prevOgUrl = ogUrl?.getAttribute("content") ?? "";
    const prevOgType = ogType?.getAttribute("content") ?? "";

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    const prevTwitterTitle = twitterTitle?.getAttribute("content") ?? "";
    const prevTwitterDesc = twitterDesc?.getAttribute("content") ?? "";
    const prevTwitterImage = twitterImage?.getAttribute("content") ?? "";

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const prevKeywords = metaKeywords?.getAttribute("content") ?? "";

    document.title = title;
    metaDesc?.setAttribute("content", description);
    ogTitle?.setAttribute("content", title);
    ogDesc?.setAttribute("content", description);
    ogImage?.setAttribute("content", resolvedImage);
    ogUrl?.setAttribute("content", url);
    ogType?.setAttribute("content", type);
    twitterTitle?.setAttribute("content", title);
    twitterDesc?.setAttribute("content", description);
    twitterImage?.setAttribute("content", resolvedImage);
    if (keywords && metaKeywords) metaKeywords.setAttribute("content", keywords);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevCanonical = canonical?.href ?? "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.id = "page-canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // og:image:alt (created on demand)
    let ogImageAlt: HTMLMetaElement | null = null;
    let createdOgImageAlt = false;
    if (imageAlt) {
      const result = ensureMeta('meta[property="og:image:alt"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:image:alt");
        return m;
      });
      ogImageAlt = result.el;
      createdOgImageAlt = result.created;
      ogImageAlt.setAttribute("content", imageAlt);
    }

    // robots (only inject when noindex requested)
    let robotsEl: HTMLMetaElement | null = null;
    let createdRobots = false;
    if (noindex) {
      const result = ensureMeta('meta[name="robots"]', () => {
        const m = document.createElement("meta");
        m.name = "robots";
        return m;
      });
      robotsEl = result.el;
      createdRobots = result.created;
      robotsEl.setAttribute("content", "noindex, nofollow");
    }

    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute("content", prevDesc);
      ogTitle?.setAttribute("content", prevOgTitle);
      ogDesc?.setAttribute("content", prevOgDesc);
      if (prevOgImage) ogImage?.setAttribute("content", prevOgImage);
      if (prevOgUrl) ogUrl?.setAttribute("content", prevOgUrl);
      if (prevOgType) ogType?.setAttribute("content", prevOgType);
      twitterTitle?.setAttribute("content", prevTwitterTitle);
      twitterDesc?.setAttribute("content", prevTwitterDesc);
      if (prevTwitterImage) twitterImage?.setAttribute("content", prevTwitterImage);
      if (keywords && metaKeywords) metaKeywords.setAttribute("content", prevKeywords);
      if (canonical) {
        if (prevCanonical) {
          canonical.href = prevCanonical;
        } else {
          canonical.remove();
        }
      }
      if (createdOgImageAlt) ogImageAlt?.remove();
      if (createdRobots) robotsEl?.remove();
    };
  }, [title, description, canonicalPath, keywords, image, imageAlt, type, noindex]);
};

export default usePageMeta;
