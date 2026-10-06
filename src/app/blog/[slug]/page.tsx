import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/layout/PageHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PostPager } from "@/components/blog/PostPager";
import { PostToc } from "@/components/blog/PostToc";
import { getPost, posts } from "@/content/posts";
import { extractHeadings } from "@/lib/content/headings";
import { formatDate } from "@/lib/content/format-date";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { postGraph } from "@/lib/seo/page-graphs";
import "@/styles/prose.css";
import "@/styles/diagrams.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: `${post.seoTitle} | ProdBuilds`,
    ogTitle: post.title,
    description: post.description,
    image: { path: `/images/blog/${post.slug}.png`, alt: `${post.title} — ProdBuilds blog` },
    article: { publishedTime: post.datePublished, modifiedTime: post.dateModified, section: post.topic },
    rss: true,
  });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { default: Body } = await import(`@/content/posts/${slug}.mdx`);
  const headings = extractHeadings(
    readFileSync(join(process.cwd(), "src/content/posts", `${slug}.mdx`), "utf8"),
  );

  return (
    <>
      <SiteHeader currentPath={`/blog/${slug}`} />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={postGraph(slug)} />
        <div aria-hidden className="reading-progress" />
        <PageHead
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.breadcrumbName },
          ]}
          title={post.title}
          lead={post.lead}
        >
          <p className="hud mt-8 flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-primary">{post.topic}</span>
            <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
            <span>{post.readMinutes} min read</span>
          </p>
        </PageHead>
        <div className="page-grid pb-(--space-section-major)">
          {/* Before the article in the DOM, so keyboard users reach it first; placed beside it by the grid. */}
          {headings.length > 1 && (
            <div className="hidden xl:col-span-3 xl:col-start-10 xl:row-start-1 xl:block">
              <div className="sticky top-[calc(var(--header-h)+2.5rem)] max-h-[calc(100dvh-var(--header-h)-4rem)] overflow-y-auto p-1">
                <PostToc headings={headings} />
              </div>
            </div>
          )}
          <div className="col-span-12 lg:col-span-8 lg:col-start-2 lg:row-start-1">
            <article className="prose">
              <Body />
            </article>
            <PostPager slug={slug} />
          </div>
        </div>
      </main>
    </>
  );
}
