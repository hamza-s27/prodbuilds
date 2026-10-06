import { SiteHeader } from "@/components/layout/SiteHeader";
import { PipelineHero } from "@/components/hero/scene-heroes/PipelineHero";
import { PageHead } from "@/components/layout/PageHead";
import { FaqList } from "@/components/process/FaqList";
import { PrinciplesGrid } from "@/components/process/PrinciplesGrid";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/components/ui/CtaBand";
import { SectionHead } from "@/components/ui/SectionHead";
import { faq } from "@/content/faq";
import { howWeWorkPage } from "@/content/inner-pages";
import { pages } from "@/content/pages";
import { principles } from "@/content/principles";
import { processSteps } from "@/content/process";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGraph } from "@/lib/seo/page-graphs";

export const metadata = buildPageMetadata(pages["/how-we-work"].seo);

export default function HowWeWorkPage() {
  return (
    <>
      <SiteHeader currentPath="/how-we-work" />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={pageGraph("/how-we-work")} />
        <PageHead
          crumbs={[{ label: "Home", href: "/" }, { label: pages["/how-we-work"].crumbLabel }]}
          title={howWeWorkPage.heading}
          lead={howWeWorkPage.lead}
          visual={<PipelineHero />}
        />
        <ProcessTimeline steps={processSteps} />

        <section id="principles" aria-labelledby="principles-heading" className="py-(--space-section)">
          <SectionHead
            index="01"
            label={howWeWorkPage.principles.label}
            headingId="principles-heading"
            heading={howWeWorkPage.principles.heading}
          />
          <div className="page-grid mt-14">
            <div className="reveal col-span-12">
              <PrinciplesGrid principles={principles} />
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="py-(--space-section)">
          <SectionHead
            index="02"
            label={howWeWorkPage.faq.label}
            headingId="faq-heading"
            heading={howWeWorkPage.faq.heading}
          />
          <div className="page-grid mt-14">
            <div className="col-span-12 md:col-span-9 md:col-start-4">
              <FaqList items={faq} />
            </div>
          </div>
        </section>

        <CtaBand heading={howWeWorkPage.cta.heading} lead={howWeWorkPage.cta.lead} />
      </main>
    </>
  );
}
