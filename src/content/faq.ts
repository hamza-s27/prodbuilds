import { CONTACT_EMAIL } from "./site";
import type { FaqItem } from "./types";

export const faq: readonly FaqItem[] = [
  {
    question: "Can you work on an existing codebase?",
    answer: [
      "Yes. We can start from your existing code, even with little handover, and improve it in place rather than rewriting it.",
    ],
  },
  {
    question: "Who owns the code?",
    answer: ["That’s set out in the written agreement for your project, which we agree before work starts."],
  },
  {
    question: "How do you handle our data?",
    answer: [
      "Only as your agreement and instructions allow. We don’t sell it, use it for advertising or train models on it, and we delete it on request or within 30 days of the agreement ending. See our ",
      { href: "/privacy", label: "privacy policy" },
      ".",
    ],
  },
  {
    question: "How do we start?",
    answer: [
      "Leave your email on the ",
      { href: "/contact", label: "contact page" },
      " or write to ",
      { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
      ". We’ll reply by email to set up a short call.",
    ],
  },
];
