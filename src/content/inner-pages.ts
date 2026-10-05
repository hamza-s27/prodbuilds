// Copy for the inner pages (headings, leads and closing calls to action).

export const servicesPage = {
  heading: "Backend, cloud and AI work that holds up in production.",
  lead: "Six ways we help, from a first version to the platform you already run.",
  cta: {
    heading: "Not sure which of these you need?",
    lead: "Tell us what you’re building and where it hurts. We’ll reply by email to set up a short call.",
  },
} as const;

export const howWeWorkPage = {
  heading: "From first call to production, with no surprises.",
  lead: "You work directly with the engineer who designs and builds your software, in short cycles you can see and steer.",
  principles: { label: "Principles", heading: "What you can expect." },
  faq: { label: "Questions", heading: "Common questions." },
  cta: {
    heading: "Ready to talk it through?",
    lead: "Tell us what you’re building. We’ll reply by email to set up a short call.",
  },
} as const;

export const contactPage = {
  heading: "Tell us what you’re building.",
  lead: "Whether it’s an AI feature, a cloud migration, or a product that doesn’t exist yet, start with a short conversation.",
  form: {
    heading: "Leave your email",
    lead: "We’ll reply by email to set up a call at a time that suits you.",
  },
  direct: { heading: "Prefer to write?" },
  next: {
    heading: "What happens next",
    steps: [
      { strong: "We read your note", rest: " and look at what you’re trying to build." },
      { strong: "We reply by email", rest: " to set up a short call." },
      { strong: "We scope it together", rest: " — requirements, constraints, and what success looks like." },
    ],
  },
} as const;

export const blogPage = {
  heading: "Engineering notes.",
  lead: "Tested write-ups on the problems that surface once software meets production: what breaks, why, and the fix, with the code and the numbers.",
} as const;
