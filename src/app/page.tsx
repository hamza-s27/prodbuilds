import { SiteHeader } from "@/components/layout/SiteHeader";
import { FindingsTerminal } from "@/components/blog/FindingsTerminal";
import { PostCards } from "@/components/blog/PostCards";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { DataFacts } from "@/components/privacy/DataFacts";
import { ProcessPipeline } from "@/components/process/ProcessPipeline";
import { JsonLd } from "@/components/seo/JsonLd";
import { StackList } from "@/components/services/StackList";
import { StackMarquee } from "@/components/services/StackMarquee";
import { SectionFootLink } from "@/components/ui/SectionFootLink";
import { SectionHead } from "@/components/ui/SectionHead";
import { findings } from "@/content/findings";
import { homeSections } from "@/content/home";
import { pages } from "@/content/pages";
import { posts } from "@/content/posts";
import { privacyFacts } from "@/content/privacy-facts";
import { processSteps } from "@/content/process";
import { services } from "@/content/services";
import { orderedByDepth, stackUnion } from "@/lib/content/services";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGraph } from "@/lib/seo/page-graphs";

export const metadata = buildPageMetadata(pages["/"].seo);

const { services: servicesCopy, data, process, blog } = homeSections;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={pageGraph("/")} />
        <Hero />

        <section id="services" aria-labelledby="services-heading" className="py-(--space-section)">
          <SectionHead
            index="01"
            label={servicesCopy.label}
            headingId="services-heading"
            heading={servicesCopy.heading}
          />
          <div className="page-grid mt-14">
            <div className="reveal col-span-12">
              <StackList services={orderedByDepth(services)} />
              <StackMarquee items={stackUnion(services)} label={servicesCopy.stackLabel} className="mt-12" />
              <SectionFootLink {...servicesCopy.footLink} />
            </div>
          </div>
        </section>

        <section aria-labelledby="data-heading" className="py-(--space-section)">
          <SectionHead index="02" label={data.label} headingId="data-heading" heading={data.heading} />
          <div className="page-grid mt-14">
            <div className="reveal col-span-12 md:col-span-9 md:col-start-4">
              <DataFacts facts={privacyFacts} />
              <SectionFootLink {...data.footLink} />
            </div>
          </div>
        </section>

        <section id="how-we-work" aria-labelledby="how-heading" className="py-(--space-section)">
          <SectionHead index="03" label={process.label} headingId="how-heading" heading={process.heading} />
          <div className="page-grid mt-14">
            <div className="reveal col-span-12">
              <ProcessPipeline steps={processSteps} />
              <SectionFootLink {...process.footLink} />
            </div>
          </div>
        </section>

        <section id="blog" aria-labelledby="blog-heading" className="py-(--space-section)">
          <SectionHead index="04" label={blog.label} headingId="blog-heading" heading={blog.heading} />
          <div className="page-grid mt-14">
            <div className="reveal col-span-12">
              <PostCards posts={posts} aside={<FindingsTerminal lines={findings} />} />
              <SectionFootLink {...blog.footLink} />
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
    </>
  );
}
