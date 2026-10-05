import type { PostMeta } from "@/content/types";
import { cn } from "@/lib/utils";

interface PostCardsProps {
  readonly posts: readonly PostMeta[];
}

/** Editorial layout: the newest post large, the next two stacked beside it. */
export function PostCards({ posts }: PostCardsProps) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <PostCard post={lead} featured className="lg:col-span-7" />
      <div className="grid gap-4 lg:col-span-5">
        {rest.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
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
