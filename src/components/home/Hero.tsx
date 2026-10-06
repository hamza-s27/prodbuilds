import type { CSSProperties } from "react";
import { PillarHero } from "@/components/hero/scene-heroes/PillarHero";
import { LeadForm } from "@/components/lead-form/LeadForm";
import { hero } from "@/content/home";
import { principles } from "@/content/principles";

const featured = principles.filter((principle) => principle.featuredInHero);

/**
 * Text is server-rendered with no entrance animation so the h1 is the LCP
 * element. The visual starts as a static poster; the WebGL pillar takes over
 * after idle (see HeroVisual).
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" data-hero className="relative isolate overflow-hidden">
      {/* No z-index here: the content below paints over the visual, while the pause button (z-20) stays clickable. */}
      <div className="absolute inset-y-0 right-0 w-full md:w-3/5">
        <PillarHero />
      </div>
      <div className="page-grid relative min-h-[calc(100svh-var(--header-h))] content-center gap-y-10 py-16 md:py-24">
        <div className="hero-copy col-span-12 md:col-span-8">
          <p className="hud text-primary">{hero.eyebrow}</p>
          <h1 id="hero-heading" className="display mt-6 text-(length:--text-hero)">
            {hero.heading}
          </h1>
          <p className="mt-8 max-w-xl text-(length:--text-lead) text-body">{hero.lead}</p>
          <LeadForm idPrefix="hero" note={hero.note} className="mt-10 max-w-lg" />
        </div>
        <ul
          aria-label="Principles"
          className="col-span-12 grid grid-cols-2 gap-3 md:col-span-4 md:col-start-9 md:grid-cols-1 md:self-end lg:col-span-3 lg:col-start-10"
        >
          {featured.map((principle, index) => (
            <li key={principle.title} className="hero-chip" style={{ "--i": index } as CSSProperties}>
              <a
                href="/how-we-work#principles-heading"
                className="surface group flex h-full items-start gap-3 rounded-hud px-4 py-3 text-sm backdrop-blur-sm transition-colors hover:border-primary"
              >
                <span aria-hidden className="hud mt-0.5 text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground">{principle.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
