/**
 * 리뷰 상세의 메타/JSON-LD 단일 생성기. 화면(Reviews)과 프리렌더가 함께 사용한다.
 * 참고 가격대는 판매처·옵션·확인일이 없어 Offer로 내보내지 않는다.
 */
import type { Shoe } from "../data/shoesDb";
import type { ReviewContent } from "../data/reviewContent";
import { shoeSlug } from "../data/reviewSlug";

export const SITE_URL = "https://runmania.kr";
export const SITE_NAME = "런닝화매니아";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export const reviewPath = (shoe: Shoe) => `/reviews/${shoeSlug(shoe.name)}`;

export const buildReviewMeta = (shoe: Shoe) => ({
  title: `${shoe.name} 리뷰 | ${shoe.brand} 러닝화 상세 분석 | ${SITE_NAME}`,
  description: `${shoe.name} 상세 리뷰 - ${shoe.description}`,
  keywords: `${shoe.name}, ${shoe.brand} 러닝화, 러닝화 리뷰, ${shoe.type}`,
});

export const buildReviewJsonLd = (
  shoe: Shoe,
  review: ReviewContent | undefined,
  image: string | undefined,
) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: shoe.name,
  brand: { "@type": "Brand", name: shoe.brand },
  description: shoe.description,
  image: image ?? DEFAULT_IMAGE,
  url: `${SITE_URL}${reviewPath(shoe)}`,
  ...(review && {
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
        },
        author: { "@type": "Organization", name: SITE_NAME },
        reviewBody: review.verdict,
      },
    ],
  }),
});
