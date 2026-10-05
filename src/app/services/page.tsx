import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHead } from "@/components/layout/PageHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceLayerSection } from "@/components/services/ServiceLayerSection";
import { CtaBand } from "@/components/ui/CtaBand";
import { servicesPage } from "@/content/inner-pages";
import { pages } from "@/content/pages";
import { services } from "@/content/services";
import { orderedByDepth } from "@/lib/content/services";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGraph } from "@/lib/seo/page-graphs";

export const metadata = buildPageMetadata(pages["/services"].seo);

export default function ServicesPage() {
  return (
    <>
      <SiteHeader currentPath="/services" />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={pageGraph("/services")} />
        <PageHead
          crumbs={[{ label: "Home", href: "/" }, { label: pages["/services"].crumbLabel }]}
          title={servicesPage.heading}
          lead={servicesPage.lead}
        />
        {orderedByDepth(services).map((service) => (
          <ServiceLayerSection key={service.id} service={service} />
        ))}
        <CtaBand heading={servicesPage.cta.heading} lead={servicesPage.cta.lead} />
      </main>
    </>
  );
}
