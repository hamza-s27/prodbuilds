import type { ReactNode } from "react";
import type { PostMeta } from "@/content/types";
import { cn } from "@/lib/utils";

interface PostCardsProps {
  readonly posts: readonly PostMeta[];
  /** Shown beside the lead post; the other posts sit side by side below. */
  readonly aside: ReactNode;
}

/** Editorial layout: the newest post large with the aside beside it, then the next two. */
export function PostCards({ posts, aside }: PostCardsProps) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
      <PostCard post={lead} featured className="md:col-span-2 lg:col-span-7" />
      <div className="grid md:col-span-2 lg:col-span-5">{aside}</div>
      {rest.map((post) => (
        <PostCard key={post.slug} post={post} className="lg:col-span-6" />
      ))}
    </div>
  );
}

interface PostCardProps {
  readonly post: PostMeta;
  readonly featured?: boolean;
  readonly className?: string;
}

function PostCard({ post, featured = false, className }: PostCardProps) {
  return (
    <article
      className={cn(
        "surface group relative flex flex-col rounded-lg p-6 transition-colors hover:border-primary md:p-8",
        featured && "justify-end lg:min-h-[26rem]",
        className,
      )}
    >
      <p className="hud flex gap-4">
        <span className="text-primary">{post.topic}</span>
        <span>{post.readMinutes} min read</span>
      </p>
      <h3
        className={cn(
          "mt-4 font-semibold tracking-tight text-balance",
          featured ? "display text-(length:--text-h2)" : "text-(length:--text-h3)",
        )}
      >
        <a href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </a>
      </h3>
      <p className="mt-4 text-body">{post.teaser}</p>
    </article>
  );
}
