import { describe, expect, it } from "vitest";
import inventory from "../../tests/fixtures/legacy/inventory.json";
import { orderedByDepth } from "@/lib/content/services";
import { toPlainText } from "@/lib/content/rich-text";
import { faq } from "./faq";
import { posts } from "./posts";
import { principles } from "./principles";
import { processSteps } from "./process";
import { services } from "./services";

type LegacyPage = (typeof inventory.pages)[number];

const page = (path: string): LegacyPage => {
  const found = inventory.pages.find((p) => p.path === path);
  if (!found) throw new Error(`No legacy page ${path}`);
  return found;
};
const headingTexts = (path: string, level: number) =>
  page(path)
    .headings.filter((h) => h.level === level)
    .map((h) => h.text);

function legacyFaq(): { question: string; answer: string }[] {
  const graph = page("/how-we-work").jsonLd[0]["@graph"] as Record<string, unknown>[];
  const faqNode = graph.find((node) => node["@type"] === "FAQPage") as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
  return faqNode.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));
}

describe("services", () => {
  it("keeps the legacy anchor ids, in legacy order", () => {
    expect(services.map((s) => s.id)).toEqual(["backend", "scaling", "cloud", "product", "automation", "ai"]);
  });

  it("keeps the legacy titles on /services and the home page", () => {
    expect(services.map((s) => s.title)).toEqual(headingTexts("/services", 2).slice(0, 6));
    expect(services.map((s) => s.title)).toEqual(headingTexts("/", 3).slice(0, 6));
  });

  it("follows the request path when ordered by depth, with AI as the rail", () => {
    expect(orderedByDepth(services).map((s) => s.id)).toEqual([
      "product",
      "backend",
      "scaling",
      "automation",
      "cloud",
      "ai",
    ]);
  });

  it("has included work, a stack, and related posts that exist", () => {
    const slugs = new Set(posts.map((p) => p.slug));
    for (const service of services) {
      expect(service.included.length).toBeGreaterThan(0);
      expect(service.stack.length).toBeGreaterThan(0);
      for (const slug of service.relatedPostSlugs) expect(slugs.has(slug)).toBe(true);
    }
  });
});

describe("process", () => {
  it("keeps the legacy step ids and titles", () => {
    expect(processSteps.map((s) => s.id)).toEqual(["step-1", "step-2", "step-3", "step-4"]);
    expect(processSteps.map((s) => s.title)).toEqual(headingTexts("/how-we-work", 2).slice(0, 4));
  });
});

describe("principles", () => {
  it("keeps the six legacy principles and features four in the hero", () => {
    expect(principles.map((p) => p.title)).toEqual(headingTexts("/how-we-work", 3).slice(0, 6));
    expect(principles.filter((p) => p.featuredInHero).map((p) => p.title)).toEqual([
      "Built to grow without a rewrite",
      "Tested end to end",
      "Direct access",
      "Honest scoping",
    ]);
  });
});

describe("faq", () => {
  it("matches the legacy FAQPage structured data word for word", () => {
    expect(faq.map((item) => ({ question: item.question, answer: toPlainText(item.answer) }))).toEqual(
      legacyFaq(),
    );
  });
});

describe("posts", () => {
  it("lists the three legacy posts with their legacy titles", () => {
    expect(posts.map((p) => p.title)).toEqual(headingTexts("/blog", 2));
    for (const post of posts) {
      expect(page(`/blog/${post.slug}`).h1).toBe(post.title);
      expect(page(`/blog/${post.slug}`).title).toBe(`${post.seoTitle} | ProdBuilds`);
      expect(page(`/blog/${post.slug}`).description).toBe(post.description);
    }
  });
});
