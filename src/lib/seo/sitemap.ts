import { legalUpdated, type StaticPath } from "@/content/pages";
import { posts } from "@/content/posts";
import { SITE_URL } from "@/content/site";

export interface SitemapEntry {
  readonly path: string;
  /** ISO date. */
  readonly lastModified: string;
}

const STATIC_ORDER: readonly StaticPath[] = [
  "/",
  "/services",
  "/how-we-work",
  "/contact",
  "/privacy",
  "/terms",
  "/blog",
];

/** Every indexable URL: static pages, then posts (newest first). */
export function sitemapEntries(): SitemapEntry[] {
  const newestPost =
    posts
      .map((post) => post.dateModified)
      .sort()
      .at(-1) ?? legalUpdated;
  const siteUpdated = newestPost > legalUpdated ? newestPost : legalUpdated;
  return [
    ...STATIC_ORDER.map((path) => ({ path, lastModified: siteUpdated })),
    ...posts.map((post) => ({ path: `/blog/${post.slug}`, lastModified: post.dateModified })),
  ];
}

export function buildSitemap(entries: readonly SitemapEntry[]): string {
  const urls = entries.map((entry) =>
    [
      "  <url>",
      `    <loc>${SITE_URL}${entry.path}</loc>`,
      `    <lastmod>${entry.lastModified}</lastmod>`,
      "  </url>",
    ].join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
