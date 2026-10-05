import { homeSections } from "@/content/home";
import { CONTACT_EMAIL } from "@/content/site";
import { LeadForm } from "@/components/lead-form/LeadForm";

const { cta } = homeSections;

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="page-grid py-(--space-section-major)">
      <div className="surface relative col-span-12 overflow-hidden rounded-xl px-6 py-16 md:px-16 md:py-24 lg:col-span-10 lg:col-start-2">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
        <h2 id="cta-heading" className="display max-w-3xl text-(length:--text-h2)">
          {cta.heading}
        </h2>
        <p className="mt-6 max-w-xl text-(length:--text-lead) text-body">{cta.lead}</p>
        <LeadForm
          idPrefix="cta"
          formLabel="Start a conversation"
          className="mt-10 max-w-lg"
          note={
            <>
              {cta.directLabel}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-inline">
                {CONTACT_EMAIL}
              </a>
            </>
          }
        />
      </div>
    </section>
  );
}
