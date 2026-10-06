import { posts } from "@/content/posts";

interface PostPagerProps {
  readonly slug: string;
}

/** Previous (older) and next (newer) post. Posts are listed newest first. */
export function PostPager({ slug }: PostPagerProps) {
  const index = posts.findIndex((post) => post.slug === slug);
  const older = posts[index + 1];
  const newer = index > 0 ? posts[index - 1] : undefined;
  if (!older && !newer) return null;

  const links = [
    older && { post: older, label: "Previous post", align: "" },
    newer && { post: newer, label: "Next post", align: "sm:col-start-2 sm:text-right" },
  ].filter((link) => !!link);

  return (
    <nav aria-label="More posts" className="mt-20 grid gap-4 border-t border-hairline pt-10 sm:grid-cols-2">
      {links.map(({ post, label, align }) => (
        <a
          key={post.slug}
          href={`/blog/${post.slug}`}
          rel={label === "Next post" ? "next" : "prev"}
          className={`surface group block rounded-lg p-6 transition-colors hover:border-primary ${align}`}
        >
          <span className="hud block">{label}</span>
          <span className="mt-3 block font-semibold tracking-tight text-balance text-foreground group-hover:text-primary">
            {post.title}
          </span>
        </a>
      ))}
    </nav>
  );
}
