// Home page copy. Section ids and heading ids match the legacy page.

export const hero = {
  eyebrow: "Backend, cloud & AI development",
  heading: "Software that holds up in production.",
  lead: "ProdBuilds designs and builds backend systems, APIs and cloud infrastructure that scale without a painful rewrite, from a first MVP to the platform you already run.",
  note: "No spam. Just a conversation.",
} as const;

export const homeSections = {
  services: {
    label: "Services",
    heading: "Backend, cloud and AI work, from first version to production scale.",
    footLink: { href: "/services", label: "All services" },
  },
  data: {
    label: "How we handle data",
    heading: "Your data stays yours.",
    footLink: { href: "/privacy", label: "Read our privacy policy" },
  },
  process: {
    label: "How we work",
    heading: "From first call to production, in four steps.",
    footLink: { href: "/how-we-work", label: "How we work, in detail" },
  },
  blog: {
    label: "Blog",
    heading: "Engineering notes.",
    footLink: { href: "/blog", label: "All posts" },
  },
  cta: {
    heading: "Ready to build something?",
    lead: "Leave your email and we’ll reach out to talk through what you have in mind.",
    directLabel: "Prefer email? Write to",
  },
} as const;
