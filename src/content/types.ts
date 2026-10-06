// Shapes for the site's copy. Content lives in these typed modules (and MDX for
// long-form prose), never inline in components.

export interface RichTextLink {
  readonly href: string;
  readonly label: string;
}

/** Inline text with optional links, e.g. ["See our ", { href, label }, "."]. */
export type RichText = readonly (string | RichTextLink)[];

export type ServiceId = "backend" | "scaling" | "cloud" | "product" | "automation" | "ai";

export interface ServiceLayer {
  /** Position in the request path (0 = closest to the user); null = cross-cutting rail. */
  readonly depth: number | null;
  /** Mono HUD label shown on the stack visual. */
  readonly hud: string;
}

export interface Service {
  readonly id: ServiceId;
  readonly tag: string;
  /** Display title, e.g. "APIs & backend systems". */
  readonly title: string;
  /** Name used in structured data, e.g. "APIs and backend systems". */
  readonly schemaName: string;
  /** One-line summary on the home page and in structured data. */
  readonly summary: string;
  /** Opening paragraph on /services. */
  readonly intro: string;
  readonly included: readonly string[];
  readonly stack: readonly string[];
  readonly relatedPostSlugs: readonly string[];
  readonly layer: ServiceLayer;
}

export interface ProcessStep {
  readonly id: `step-${number}`;
  /** e.g. "01 — Discover" */
  readonly label: string;
  readonly title: string;
  /** Short version on the home page. */
  readonly summary: string;
  /** Longer version on /how-we-work. */
  readonly detail: string;
  readonly deliverable: string;
}

export interface Principle {
  readonly title: string;
  readonly body: RichText;
  readonly featuredInHero: boolean;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: RichText;
}

/** How a fact's value animates in: a count up from 0, or a decrypt into the word. */
export type FactEffect = "count" | "decrypt";

export interface PrivacyFact {
  readonly value: string;
  readonly unit?: string;
  readonly label: string;
  readonly effect?: FactEffect;
}

/** One line of the findings terminal on the home page. */
export interface TerminalLine {
  readonly kind: "command" | "output";
  readonly text: string;
  readonly tone?: "good" | "bad" | "muted";
}

export interface PostMeta {
  readonly slug: string;
  /** The h1 and structured-data headline. */
  readonly title: string;
  /** The <title> before " | ProdBuilds". */
  readonly seoTitle: string;
  readonly description: string;
  /** Subtitle under the h1 on the post page. */
  readonly lead: string;
  /** Teaser on the home page and blog index. */
  readonly teaser: string;
  readonly topic: string;
  /** ISO date, e.g. "2026-09-26". */
  readonly datePublished: string;
  readonly dateModified: string;
  readonly readMinutes: number;
  readonly keywords: readonly string[];
  readonly wordCount: number;
  /** Short name used in breadcrumbs. */
  readonly breadcrumbName: string;
}

export interface NavLink {
  readonly href: string;
  readonly label: string;
}
