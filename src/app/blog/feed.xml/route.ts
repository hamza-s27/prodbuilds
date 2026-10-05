import { posts } from "@/content/posts";
import { buildRss } from "@/lib/feed/build-rss";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRss(posts), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
