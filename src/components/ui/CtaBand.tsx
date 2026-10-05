interface CtaBandProps {
  readonly heading: string;
  readonly lead: string;
  readonly href?: string;
  readonly label?: string;
}

/** Closing call to action that links to /contact (inner pages). */
export function CtaBand({ heading, lead, href = "/contact", label = "Get in touch" }: CtaBandProps) {
  return (
    <section aria-labelledby="cta-heading" className="page-grid py-(--space-section-major)">
      <div className="surface relative col-span-12 overflow-hidden rounded-xl px-6 py-16 md:px-16 lg:col-span-10 lg:col-start-2">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
        <h2 id="cta-heading" className="display max-w-3xl text-(length:--text-h2)">
          {heading}
        </h2>
        <p className="mt-6 max-w-xl text-(length:--text-lead) text-body">{lead}</p>
        <a href={href} className="btn-primary mt-10">
          {label}
        </a>
      </div>
    </section>
  );
}
