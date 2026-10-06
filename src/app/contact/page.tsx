import { SiteHeader } from "@/components/layout/SiteHeader";
import { LeadForm } from "@/components/lead-form/LeadForm";
import { PageHead } from "@/components/layout/PageHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { contactPage } from "@/content/inner-pages";
import { pages } from "@/content/pages";
import { CONTACT_EMAIL } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGraph } from "@/lib/seo/page-graphs";

export const metadata = buildPageMetadata(pages["/contact"].seo);

const { form, direct, next } = contactPage;

export default function ContactPage() {
  return (
    <>
      <SiteHeader currentPath="/contact" />
      <main id="main-content" tabIndex={-1}>
        <JsonLd data={pageGraph("/contact")} />
        <PageHead
          crumbs={[{ label: "Home", href: "/" }, { label: pages["/contact"].crumbLabel }]}
          title={contactPage.heading}
          lead={contactPage.lead}
        />
        <div className="page-grid gap-y-16 pb-(--space-section-major)">
          <section
            aria-labelledby="form-heading"
            className="surface col-span-12 rounded-xl p-6 md:p-10 lg:col-span-6 lg:col-start-2"
          >
            <h2 id="form-heading" className="display text-(length:--text-h3) md:text-4xl">
              {form.heading}
            </h2>
            <p className="mt-4 text-body">{form.lead}</p>
            <LeadForm
              idPrefix="contact"
              className="mt-8"
              note={
                <>
                  We only use your email to reply. See our{" "}
                  <a href="/privacy" className="link-inline">
                    privacy policy
                  </a>
                  .
                </>
              }
            />
          </section>

          <section aria-labelledby="direct-heading" className="col-span-12 lg:col-span-4 lg:col-start-9">
            <h2 id="direct-heading" className="hud">
              {direct.heading}
            </h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="link-draw mt-4 inline-block text-2xl font-semibold tracking-tight text-foreground [font-variation-settings:'wdth'_110]"
            >
              {CONTACT_EMAIL}
            </a>
            <h2 className="hud mt-14">{next.heading}</h2>
            {/* A static pipeline: nodes joined by a hairline, the first one live. */}
            <ol className="mt-6">
              {next.steps.map((step, index) => (
                <li
                  key={step.strong}
                  className="relative pb-7 pl-9 text-body before:absolute before:top-5 before:bottom-0 before:left-[5px] before:w-px before:bg-gradient-to-b before:from-primary before:to-border last:pb-0 last:before:hidden"
                >
                  <span
                    aria-hidden
                    className={`absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-primary ${index === 0 ? "bg-primary shadow-[0_0_10px_var(--brand-teal-glow)]" : "bg-background"}`}
                  />
                  <span aria-hidden className="hud block text-primary">
                    Step {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block">
                    <strong className="font-semibold text-foreground">{step.strong}</strong>
                    {step.rest}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}
