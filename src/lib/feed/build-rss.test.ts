// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { posts } from "@/content/posts";
import { buildRss, escapeXml } from "./build-rss";

const legacyFeed = readFileSync(resolve("tests/fixtures/legacy/feed.xml"), "utf8");

describe("buildRss", () => {
  it("reproduces the legacy feed exactly", () => {
    expect(buildRss(posts)).toBe(legacyFeed);
  });
});

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`a & b < c > d "e" 'f'`)).toBe("a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;");
  });
});
