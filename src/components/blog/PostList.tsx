import type { PostMeta } from "@/content/types";
import { formatDate } from "@/lib/content/format-date";

interface PostListProps {
  readonly posts: readonly PostMeta[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <section aria-label="Posts" className="border-t border-hairline">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="group relative grid gap-4 border-b border-hairline py-10 md:grid-cols-12 md:gap-8"
        >
          <p className="hud flex flex-wrap gap-x-4 gap-y-1 md:col-span-3 md:flex-col">
            <span className="text-primary">{post.topic}</span>
            <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
            <span>{post.readMinutes} min read</span>
          </p>
          <div className="md:col-span-9">
            <h2 className="display text-(length:--text-h3) md:text-4xl">
              <a
                href={`/blog/${post.slug}`}
                className="after:absolute after:inset-0 group-hover:text-primary"
              >
                {post.title}
              </a>
            </h2>
            <p className="mt-4 max-w-2xl text-body">{post.teaser}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
