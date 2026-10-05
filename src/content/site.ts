import leadEndpoint from "./lead-endpoint.json";
import type { NavLink } from "./types";

export const SITE_URL = "https://prodbuilds.com";
export const SITE_NAME = "ProdBuilds";
export const CONTACT_EMAIL = "hello@prodbuilds.com";

/** Google Apps Script endpoint the lead forms post to (public, as on the old site). */
export const LEAD_ENDPOINT: string = leadEndpoint.url;

export const THEME_COLOR = "#0C0C0F";

export const ORG_DESCRIPTION =
  "ProdBuilds designs and builds backend systems, APIs, cloud infrastructure and AI integrations that hold up in production.";

/** Organization.knowsAbout in structured data. */
export const ORG_KNOWS_ABOUT: readonly string[] = [
  "Backend development",
  "API design",
  "Java",
  "Spring Boot",
  "Node.js",
  "Distributed systems",
  "Caching",
  "Message queues",
  "Cloud infrastructure",
  "Amazon Web Services",
  "Docker",
  "Kubernetes",
  "Firebase",
  "Web automation",
  "Robotic process automation",
  "Large language models",
  "Model Context Protocol",
];

export const DEFAULT_OG_IMAGE = {
  path: "/images/og.png",
  alt: "ProdBuilds: Software that holds up in production. Backend, cloud and AI development.",
} as const;

export const mainNav: readonly NavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/blog", label: "Blog" },
];

export const NAV_CTA: NavLink = { href: "/contact", label: "Get in touch" };

export const footerNav: readonly NavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
];
