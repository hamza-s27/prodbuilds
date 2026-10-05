import type { Principle } from "./types";

export const principles: readonly Principle[] = [
  {
    title: "Built to grow without a rewrite",
    body: [
      "Simple, containerised foundations that scale when you need them to, instead of a rebuild in year two.",
    ],
    featuredInHero: true,
  },
  {
    title: "Tested end to end",
    body: ["Unit, integration and end-to-end tests are part of the work, not an optional extra."],
    featuredInHero: true,
  },
  {
    title: "Direct access",
    body: ["You talk to the engineer designing and building your software, not a chain of account managers."],
    featuredInHero: true,
  },
  {
    title: "Honest scoping",
    body: ["If something will take longer, cost more or isn’t worth building, you’ll hear it early."],
    featuredInHero: true,
  },
  {
    title: "Works with your team",
    body: ["We fit into existing codebases and work alongside your frontend, QA and infrastructure people."],
    featuredInHero: false,
  },
  {
    title: "Your data stays yours",
    body: [
      "No selling it, no advertising use and no training models on it. ",
      { href: "/privacy", label: "Our privacy policy" },
      " has the details.",
    ],
    featuredInHero: false,
  },
];
