import { describe, expect, it } from "vitest";
import inventory from "../../../tests/fixtures/legacy/inventory.json";
import { posts } from "@/content/posts";
import { pageGraph, postGraph } from "./page-graphs";

const legacyJsonLd = (path: string): unknown => {
  const page = inventory.pages.find((p) => p.path === path);
  if (!page) throw new Error(`No legacy page ${path}`);
  return page.jsonLd[0];
};

describe("structured data matches the legacy site", () => {
  it.each(["/", "/services", "/how-we-work", "/contact", "/privacy", "/terms", "/blog"] as const)(
    "%s",
    (path) => {
      expect(pageGraph(path)).toEqual(legacyJsonLd(path));
    },
  );

  it.each(posts.map((post) => post.slug))("/blog/%s", (slug) => {
    expect(postGraph(slug)).toEqual(legacyJsonLd(`/blog/${slug}`));
  });

  it("throws for an unknown post", () => {
    expect(() => postGraph("nope")).toThrow(/Unknown post/);
  });
});
