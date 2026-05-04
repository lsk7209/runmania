import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
}

const BASE_URL = "https://www.runmania.kr";

const usePageMeta = ({ title, description, canonicalPath, keywords }: PageMetaOptions) => {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const prevOgTitle = ogTitle?.getAttribute("content") ?? "";
    const prevOgDesc = ogDesc?.getAttribute("content") ?? "";
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const prevTwitterTitle = twitterTitle?.getAttribute("content") ?? "";
    const prevTwitterDesc = twitterDesc?.getAttribute("content") ?? "";
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const prevKeywords = metaKeywords?.getAttribute("content") ?? "";

    document.title = title;
    metaDesc?.setAttribute("content", description);
    ogTitle?.setAttribute("content", title);
    ogDesc?.setAttribute("content", description);
    twitterTitle?.setAttribute("content", title);
    twitterDesc?.setAttribute("content", description);
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
    canonical.href = `${BASE_URL}${canonicalPath}`;

    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute("content", prevDesc);
      ogTitle?.setAttribute("content", prevOgTitle);
      ogDesc?.setAttribute("content", prevOgDesc);
      twitterTitle?.setAttribute("content", prevTwitterTitle);
      twitterDesc?.setAttribute("content", prevTwitterDesc);
      if (keywords && metaKeywords) metaKeywords.setAttribute("content", prevKeywords);
      if (canonical) {
        if (prevCanonical) {
          canonical.href = prevCanonical;
        } else {
          canonical.remove();
        }
      }
    };
  }, [title, description, canonicalPath, keywords]);
};

export default usePageMeta;
