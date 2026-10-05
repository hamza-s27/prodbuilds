import { SiteHeader } from "@/components/layout/SiteHeader";
import { PostList } from "@/components/blog/PostList";
import { PageHead } from "@/components/layout/PageHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPage } from "@/content/inner-pages";
import { pages } from "@/content/pages";
import { posts } from "@/content/posts";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGraph } from "@/lib/seo/page-graphs";

export const metadata = buildPageMetadata(pages["/blog"].seo);

export default function BlogPage() {
  return (
    <>
      <SiteHeader currentPath="/blog" />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={pageGraph("/blog")} />
        <PageHead
          crumbs={[{ label: "Home", href: "/" }, { label: pages["/blog"].crumbLabel }]}
          title={blogPage.heading}
          lead={blogPage.lead}
        />
        <div className="page-grid pb-(--space-section-major)">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <PostList posts={posts} />
          </div>
        </div>
      </main>
    </>
  );
}
