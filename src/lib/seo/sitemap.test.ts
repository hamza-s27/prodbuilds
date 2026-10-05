// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { expectedSitemap } from "../../../tests/fixtures/expected-legacy";
import { buildSitemap, sitemapEntries } from "./sitemap";

const legacySitemap = readFileSync(resolve("tests/fixtures/legacy/sitemap.xml"), "utf8");

describe("sitemap", () => {
  it("lists every legacy URL in the legacy order", () => {
    expect(sitemapEntries().map((entry) => entry.path)).toEqual([
      "/",
      "/services",
      "/how-we-work",
      "/contact",
      "/privacy",
      "/terms",
      "/blog",
      "/blog/spring-boot-scheduled-jobs-multiple-instances",
      "/blog/jobrunr-skipping-recurring-jobs",
      "/blog/firebase-auction-close-on-time",
    ]);
  });

  it("reproduces the legacy sitemap, apart from intentional page updates", () => {
    expect(buildSitemap(sitemapEntries())).toBe(expectedSitemap(legacySitemap));
  });
});

describe("sitemap freshness", () => {
  it("dates the home page and blog index by their newest post", async () => {
    const { pages } = await import("@/content/pages");
    const { posts } = await import("@/content/posts");
    const newest = posts
      .map((post) => post.dateModified)
      .sort()
      .at(-1);

    expect(pages["/"].updated >= newest!).toBe(true);
    expect(pages["/blog"].updated >= newest!).toBe(true);
  });
});
