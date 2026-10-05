import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/content/site";

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`;

const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
const FEED_PATH = "/blog/feed.xml";

const ROBOTS = {
  full: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  basic: { index: true, follow: true },
} as const;

export interface PageSeo {
  readonly path: string;
  /** Full <title>, including any " | ProdBuilds" suffix. */
  readonly title: string;
  readonly description: string;
  /** Open Graph / Twitter title when it differs from <title>. */
  readonly ogTitle?: string;
  readonly image?: { readonly path: string; readonly alt: string };
  readonly robots?: keyof typeof ROBOTS;
  readonly keywords?: string;
  readonly article?: {
    readonly publishedTime: string;
    readonly modifiedTime: string;
    readonly section: string;
  };
  /** Adds the blog RSS <link rel="alternate">. */
  readonly rss?: boolean;
}

export function buildPageMetadata(seo: PageSeo): Metadata {
  const url = absoluteUrl(seo.path);
  const ogTitle = seo.ogTitle ?? seo.title;
  const image = seo.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = absoluteUrl(image.path);

  return {
    title: { absolute: seo.title },
    description: seo.description,
    ...(seo.keywords ? { keywords: seo.keywords } : {}),
    robots: { ...ROBOTS[seo.robots ?? "full"] },
    alternates: {
      canonical: url,
      ...(seo.rss ? { types: { "application/rss+xml": absoluteUrl(FEED_PATH) } } : {}),
    },
    openGraph: {
      type: seo.article ? "article" : "website",
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      title: ogTitle,
      description: seo.description,
      images: [{ url: imageUrl, type: "image/png", ...OG_IMAGE_SIZE, alt: image.alt }],
      ...(seo.article ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: seo.description,
      images: [{ url: imageUrl, alt: image.alt }],
    },
  };
}
