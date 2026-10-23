/**
 * 리뷰 URL 슬러그 규칙. 화면(Reviews), 프리렌더, 사이트맵이 같은 규칙을 쓴다.
 * 기존 공개 주소(한글 슬러그)를 그대로 보존한다.
 */
import { SHOES_DB, type Shoe } from "./shoesDb";

export const shoeSlug = (name: string): string =>
  name.replace(/\s+/g, "-").replace(/[()]/g, "").toLowerCase();

export const findShoeBySlug = (slug: string): Shoe | undefined =>
  SHOES_DB.find((shoe) => shoeSlug(shoe.name) === slug);

export const REVIEW_SLUGS: string[] = SHOES_DB.map((shoe) => shoeSlug(shoe.name));
