import type { ReactNode } from "react";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

interface PageHeadProps {
  readonly crumbs: readonly BreadcrumbItem[];
  readonly title: string;
  readonly lead?: ReactNode;
  readonly children?: ReactNode;
}

/** Inner-page heading: breadcrumb, expanded h1, lead. Offset into the grid for asymmetry. */
export function PageHead({ crumbs, title, lead, children }: PageHeadProps) {
  return (
    <div className="page-grid pt-16 pb-12 md:pt-24 md:pb-20">
      <div className="col-span-12 lg:col-span-10 lg:col-start-2">
        <Breadcrumbs items={crumbs} />
        <h1 className="display mt-8 text-(length:--text-h1)">{title}</h1>
        {lead && <p className="mt-8 max-w-2xl text-(length:--text-lead) text-body">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
