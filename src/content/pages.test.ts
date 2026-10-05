import { describe, expect, it } from "vitest";
import inventory from "../../tests/fixtures/legacy/inventory.json";
import { pages, type StaticPath } from "./pages";

const ROBOTS_TEXT = {
  full: "index, follow, max-image-preview:large, max-snippet:-1",
  basic: "index, follow",
} as const;

describe("static page SEO matches the legacy site", () => {
  it.each(Object.keys(pages) as StaticPath[])("%s", (path) => {
    const legacy = inventory.pages.find((p) => p.path === path);
    const { seo } = pages[path];

    expect(seo.title).toBe(legacy?.title);
    expect(seo.description).toBe(legacy?.description);
    expect(seo.ogTitle ?? seo.title).toBe(legacy?.og["og:title"]);
    expect(ROBOTS_TEXT[seo.robots ?? "full"]).toBe(legacy?.robots);
    expect(seo.keywords ?? null).toBe(legacy?.keywords);
    expect(Boolean(seo.rss)).toBe(legacy?.rssHref !== null);
  });
});
