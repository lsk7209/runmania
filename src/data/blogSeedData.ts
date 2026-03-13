/**
 * Blog seed data for migrating hardcoded posts to database.
 * References LOCAL_POSTS from localBlogPosts.ts to avoid duplicating content.
 */

import { LOCAL_POSTS } from "@/data/localBlogPosts";

// Reverse mapping: slug → DB hero_image path
const SLUG_TO_HERO: Record<string, string> = {
  "beginner-running-shoe-guide": "/assets/shoes/nb-1080.png",
  "knee-pain-running-shoes": "/assets/shoes/hoka-bondi.png",
  "plantar-fasciitis-shoes": "/assets/shoes/nb-more.png",
  "overweight-running-shoes": "/assets/shoes/hoka-bondi.png",
  "wide-foot-running-shoes": "/assets/shoes/nb-1080.png",
  "nike-vs-newbalance": "/assets/shoes/nike-pegasus.png",
  "flat-foot-stability": "/assets/shoes/asics-kayano.png",
  "running-shoe-lifespan": "/assets/shoes/saucony-speed.png",
  "shin-splints-running-shoes": "/assets/shoes/hoka-bondi.png",
  "achilles-tendon-shoes": "/assets/shoes/asics-kayano.png",
  "hip-pain-running-shoes": "/assets/shoes/nb-more.png",
  "high-arch-running-shoes": "/assets/shoes/nb-1080.png",
  "supination-running-shoes": "/assets/shoes/hoka-bondi.png",
  "women-running-shoes": "/assets/shoes/nike-pegasus.png",
  "hoka-vs-asics": "/assets/shoes/hoka-bondi.png",
  "brooks-vs-saucony": "/assets/shoes/saucony-speed.png",
  "best-running-shoes-2025": "/assets/shoes/nike-pegasus.png",
  "treadmill-vs-outdoor-shoes": "/assets/shoes/nb-1080.png",
  "running-shoe-stack-height": "/assets/shoes/nb-more.png",
  "break-in-running-shoes": "/assets/shoes/saucony-speed.png",
};

export interface SeedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  tags: string[];
  read_time: string;
  hero_image: string;
  related_slugs: string[];
  faq: { question: string; answer: string }[];
  published_at: string;
}

export const getHardcodedPosts = (): SeedPost[] => {
  return LOCAL_POSTS.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    read_time: post.readTime,
    hero_image: SLUG_TO_HERO[post.slug] || "/assets/shoes/nb-1080.png",
    related_slugs: post.relatedSlugs,
    faq: post.faq,
    published_at: `${post.date}T00:00:00Z`,
  }));
};
