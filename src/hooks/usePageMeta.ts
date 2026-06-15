import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

const BASE_URL = "https://runmania.kr";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const usePageMeta = ({ title, description, canonicalPath, keywords, ogImage, ogType }: PageMetaOptions) => {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const ogTypeMeta = document.querySelector('meta[property="og:type"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');

    const prevOgTitle = ogTitle?.getAttribute("content") ?? "";
    const prevOgDesc = ogDesc?.getAttribute("content") ?? "";
    const prevOgImage = ogImageMeta?.getAttribute("content") ?? "";
    const prevOgUrl = ogUrlMeta?.getAttribute("content") ?? "";
    const prevOgType = ogTypeMeta?.getAttribute("content") ?? "";
    const prevTwitterTitle = twitterTitle?.getAttribute("content") ?? "";
    const prevTwitterDesc = twitterDesc?.getAttribute("content") ?? "";
    const prevTwitterImage = twitterImage?.getAttribute("content") ?? "";
    const prevKeywords = metaKeywords?.getAttribute("content") ?? "";

    const resolvedImage = ogImage ?? DEFAULT_OG_IMAGE;
    const resolvedUrl = `${BASE_URL}${canonicalPath}`;

    document.title = title;
    metaDesc?.setAttribute("content", description);
    ogTitle?.setAttribute("content", title);
    ogDesc?.setAttribute("content", description);
    ogImageMeta?.setAttribute("content", resolvedImage);
    ogUrlMeta?.setAttribute("content", resolvedUrl);
    if (ogType && ogTypeMeta) ogTypeMeta.setAttribute("content", ogType);
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
    canonical.href = resolvedUrl;

    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute("content", prevDesc);
      ogTitle?.setAttribute("content", prevOgTitle);
      ogDesc?.setAttribute("content", prevOgDesc);
      ogImageMeta?.setAttribute("content", prevOgImage);
      ogUrlMeta?.setAttribute("content", prevOgUrl);
      if (ogType && ogTypeMeta) ogTypeMeta.setAttribute("content", prevOgType);
      twitterTitle?.setAttribute("content", prevTwitterTitle);
      twitterDesc?.setAttribute("content", prevTwitterDesc);
      twitterImage?.setAttribute("content", prevTwitterImage);
      if (keywords && metaKeywords) metaKeywords.setAttribute("content", prevKeywords);
      if (canonical) {
        if (prevCanonical) {
          canonical.href = prevCanonical;
        } else {
          canonical.remove();
        }
      }
    };
  }, [title, description, canonicalPath, keywords, ogImage, ogType]);
};

export default usePageMeta;
