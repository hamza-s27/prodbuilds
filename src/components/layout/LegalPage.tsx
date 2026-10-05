import { SiteHeader } from "@/components/layout/SiteHeader";
import type { ComponentType } from "react";
import { pages } from "@/content/pages";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatDate } from "@/lib/content/format-date";
import { pageGraph } from "@/lib/seo/page-graphs";
import { PageHead } from "./PageHead";
import "@/styles/prose.css";

interface LegalPageProps {
  readonly path: "/privacy" | "/terms";
  readonly Body: ComponentType;
}

export function LegalPage({ path, Body }: LegalPageProps) {
  const page = pages[path];
  return (
    <>
      <SiteHeader currentPath={path} />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={pageGraph(path)} />
        <PageHead crumbs={[{ label: "Home", href: "/" }, { label: page.crumbLabel }]} title={page.name}>
          <p className="hud mt-8">
            Last updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
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
