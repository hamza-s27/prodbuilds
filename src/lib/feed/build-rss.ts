import { SITE_URL } from "@/content/site";
import type { PostMeta } from "@/content/types";

const FEED_DESCRIPTION = "Engineering write-ups from ProdBuilds, with tested code and measured results.";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const XML_ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

/** "2026-09-26" → "Sat, 26 Sep 2026 12:00:00 +0000" (RFC 822, noon UTC as on the legacy feed). */
function rfc822(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${DAYS[date.getUTCDay()]}, ${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} 12:00:00 +0000`;
}

function item(post: PostMeta): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    `      <pubDate>${rfc822(post.datePublished)}</pubDate>`,
    `      <category>${escapeXml(post.topic)}</category>`,
    `      <description>${escapeXml(post.teaser)}</description>`,
    "    </item>",
  ].join("\n");
}

/** RSS 2.0 for the blog, newest first, in the same shape as the legacy feed. */
export function buildRss(posts: readonly PostMeta[]): string {
  const lastBuild =
    posts
      .map((post) => post.dateModified)
      .sort()
      .at(-1) ?? "1970-01-01";
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    "  <channel>",
    "    <title>ProdBuilds blog</title>",
    `    <link>${SITE_URL}/blog</link>`,
    `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>`,
    `    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />`,
    ...posts.map(item),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
