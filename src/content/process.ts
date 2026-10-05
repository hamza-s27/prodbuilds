import type { ProcessStep } from "./types";

export const processSteps: readonly ProcessStep[] = [
  {
    id: "step-1",
    label: "01 — Discover",
    title: "Scope & strategy",
    summary:
      "We map your requirements, constraints and success criteria, so there are no surprises three months in.",
    detail:
      "It starts with a short call about what you’re building, who it’s for and what constrains it: budget, deadlines and the systems already in place.",
    deliverable: "An agreed scope: requirements, assumptions, risks and what success looks like.",
  },
  {
    id: "step-2",
    label: "02 — Design",
    title: "Architecture & plan",
    summary: "The architecture, data model and main user flows are agreed before production code is written.",
    detail:
      "Before production code is written, we agree the architecture, the data model and the main user flows, and choose tools your team will be comfortable living with.",
    deliverable: "An architecture you can explain, and a plan in small, shippable steps.",
  },
  {
    id: "step-3",
    label: "03 — Build",
    title: "Iterative delivery",
    summary:
      "Short cycles with regular demos and automated tests, so you see working software, not status updates.",
    detail:
      "Work ships in short cycles with regular demos, so you can steer early. Every change comes with automated tests: unit, integration and end-to-end.",
    deliverable: "Working software from early on, and a test suite that keeps it working.",
  },
  {
    id: "step-4",
    label: "04 — Deploy",
    title: "Launch & support",
    summary: "We handle production deployment and monitoring, and stay on for support after launch.",
    detail:
      "We take care of the production deployment and monitoring, and stay on after launch, when real users find the edge cases.",
    deliverable: "A running system, the knowledge to operate it, and support after launch.",
  },
];
