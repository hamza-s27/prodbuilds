import type { ReactNode } from "react";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

interface PageHeadProps {
  readonly crumbs: readonly BreadcrumbItem[];
  readonly title: string;
  readonly lead?: ReactNode;
  readonly children?: ReactNode;
  /** A hero scene (components/hero/scene-heroes) drawn full-bleed behind the heading. */
  readonly visual?: ReactNode;
  /** "compact" keeps what follows the hero (a form, a policy) close to the fold. */
  readonly visualSize?: "tall" | "compact";
}

/** Inner-page heading: breadcrumb, expanded h1, lead. Offset into the grid for asymmetry. */
const HERO_HEIGHT = {
  tall: "min-h-[min(78svh,46rem)]",
  compact: "min-h-[min(58svh,34rem)]",
} as const;

export function PageHead({ crumbs, title, lead, children, visual, visualSize = "tall" }: PageHeadProps) {
  const heading = (
    <>
      <Breadcrumbs items={crumbs} />
      <h1 className="display mt-8 text-(length:--text-h1)">{title}</h1>
      {lead && <p className="mt-8 max-w-2xl text-(length:--text-lead) text-body">{lead}</p>}
      {children}
    </>
  );

  if (!visual) {
    return (
      <div className="page-grid pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="col-span-12 lg:col-span-10 lg:col-start-2">{heading}</div>
      </div>
    );
  }

  return (
    <div data-hero className="page-hero relative isolate overflow-hidden">
      {/* No z-index: the heading paints over the visual; the pause button (z-20) stays clickable. */}
      <div className="absolute inset-0">{visual}</div>
      <div
        className={`page-grid relative ${HERO_HEIGHT[visualSize]} content-center pt-16 pb-12 md:pt-24 md:pb-20`}
      >
        <div className="hero-copy col-span-12 md:col-span-8 lg:col-span-7 lg:col-start-2">{heading}</div>
      </div>
    </div>
  );
}
