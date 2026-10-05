import { buildSitemap, sitemapEntries } from "@/lib/seo/sitemap";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildSitemap(sitemapEntries()), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
