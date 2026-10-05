// @vitest-environment node
import { describe, expect, it } from "vitest";
import { extractInventory, pathFromFixtureName } from "./extract-inventory.mjs";

const HTML = `<!doctype html><html lang="en"><head>
<title>Services | ProdBuilds</title>
<meta name="description" content="Six ways we help.">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0C0C0F">
<link rel="canonical" href="https://prodbuilds.com/services">
<link rel="alternate" type="application/rss+xml" title="Feed" href="/blog/feed.xml">
<meta property="og:title" content="OG Services">
<meta property="og:image" content="https://prodbuilds.com/images/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta property="article:section" content="Spring Boot">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"https://prodbuilds.com/services#webpage"},{"@type":"BreadcrumbList"}]}</script>
</head><body>
<a href="#main-content">Skip</a>
<main id="main-content"><h1>Backend &amp; cloud</h1>
<section id="backend"><h2 id="backend-heading">APIs <span>&amp;</span> backend</h2><h3>What’s included</h3></section>
</main></body></html>`;

describe("extractInventory", () => {
  const inventory = extractInventory(HTML);

  it("captures head metadata", () => {
    expect(inventory).toMatchObject({
      lang: "en",
      title: "Services | ProdBuilds",
      description: "Six ways we help.",
      robots: "index, follow",
      themeColor: "#0C0C0F",
      canonical: "https://prodbuilds.com/services",
      rssHref: "/blog/feed.xml",
      og: { "og:title": "OG Services", "og:image": "https://prodbuilds.com/images/og.png" },
      twitter: { "twitter:card": "summary_large_image" },
      article: { "article:section": "Spring Boot" },
    });
  });

  it("captures JSON-LD documents and their @types and @ids", () => {
    expect(inventory.jsonLd).toHaveLength(1);
    expect(inventory.jsonLdTypes).toEqual(["BreadcrumbList", "WebPage"]);
    expect(inventory.jsonLdIds).toEqual(["https://prodbuilds.com/services#webpage"]);
  });

  it("captures headings with normalised text, and every element id", () => {
    expect(inventory.h1).toBe("Backend & cloud");
    expect(inventory.headings).toEqual([
      { level: 1, id: null, text: "Backend & cloud" },
      { level: 2, id: "backend-heading", text: "APIs & backend" },
      { level: 3, id: null, text: "What’s included" },
    ]);
    expect(inventory.ids).toEqual(["backend", "backend-heading", "main-content"]);
  });

  it("keeps every value of a repeated meta property", () => {
    const repeated = extractInventory(
      `<head><meta property="article:tag" content="a"><meta property="article:tag" content="b"></head>`,
    );

    expect(repeated.article).toEqual({ "article:tag": ["a", "b"] });
  });

  it("names the problem when JSON-LD is malformed", () => {
    expect(() => extractInventory(`<script type="application/ld+json">{oops</script>`)).toThrow(
      /Malformed JSON-LD/,
    );
  });

  it("returns nulls for missing metadata", () => {
    const empty = extractInventory("<html><head></head><body></body></html>");

    expect(empty).toMatchObject({ title: null, description: null, canonical: null, h1: null });
    expect(empty.jsonLd).toEqual([]);
  });
});

describe("pathFromFixtureName", () => {
  it("maps crawl fixture names to site paths", () => {
    expect(pathFromFixtureName("home.html")).toBe("/");
    expect(pathFromFixtureName("how-we-work.html")).toBe("/how-we-work");
    expect(pathFromFixtureName("blog_firebase-auction-close-on-time.html")).toBe(
      "/blog/firebase-auction-close-on-time",
    );
  });
});
