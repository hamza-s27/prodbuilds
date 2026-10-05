import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/layout/PageHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPost, posts } from "@/content/posts";
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
          <article className="prose col-span-12 lg:col-span-8 lg:col-start-2">
            <Body />
          </article>
        </div>
      </main>
    </>
  );
}
