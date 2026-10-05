// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
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

  it("reproduces the legacy sitemap exactly", () => {
    expect(buildSitemap(sitemapEntries())).toBe(legacySitemap);
  });
});
