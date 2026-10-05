// @vitest-environment node
import { describe, expect, it } from "vitest";
import { budgetFor, evaluateBudgets, extractAssets, routeFromHtmlFile } from "./budget.mjs";

describe("extractAssets", () => {
  it("collects unique local script srcs and stylesheet hrefs", () => {
    const html = `
      <link rel="stylesheet" href="/_next/static/chunks/a.css" data-precedence="next"/>
      <link rel="preload" as="font" href="/_next/static/media/f.woff2"/>
      <script src="/_next/static/chunks/main.js" async=""></script>
      <script src="/_next/static/chunks/main.js" async=""></script>
      <script src="https://cdn.example.com/x.js"></script>
      <script>self.__next_f.push([1,""])</script>`;

    expect(extractAssets(html)).toEqual({
      scripts: ["/_next/static/chunks/main.js"],
      styles: ["/_next/static/chunks/a.css"],
    });
  });

  it("skips noModule scripts, which modern browsers never download", () => {
    const html = `
      <script src="/_next/static/chunks/main.js" async=""></script>
      <script src="/_next/static/chunks/polyfills.js" noModule=""></script>`;

    expect(extractAssets(html).scripts).toEqual(["/_next/static/chunks/main.js"]);
  });

  it("counts preloaded scripts that have no script tag", () => {
    const html = `
      <link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/a.js"/>
      <link rel="modulepreload" href="/_next/static/chunks/b.js"/>
      <script src="/_next/static/chunks/a.js" async=""></script>`;

    expect(extractAssets(html).scripts).toEqual(["/_next/static/chunks/a.js", "/_next/static/chunks/b.js"]);
  });

  it("returns empty lists for HTML without assets", () => {
    expect(extractAssets("<p>hi</p>")).toEqual({ scripts: [], styles: [] });
  });
});

describe("routeFromHtmlFile", () => {
  it("maps exported HTML files to clean routes", () => {
    expect(routeFromHtmlFile("index.html")).toBe("/");
    expect(routeFromHtmlFile("services.html")).toBe("/services");
    expect(routeFromHtmlFile("blog/some-post.html")).toBe("/blog/some-post");
    expect(routeFromHtmlFile("docs/index.html")).toBe("/docs/");
  });

  it("skips Next's internal not-found pages", () => {
    expect(routeFromHtmlFile("_not-found.html")).toBeNull();
    expect(routeFromHtmlFile("_not-found/index.html")).toBeNull();
  });

  it("maps 404.html to /404", () => {
    expect(routeFromHtmlFile("404.html")).toBe("/404");
  });
});

describe("budgetFor / evaluateBudgets", () => {
  const budgets = {
    default: { initialJsKb: 110, cssKb: 30 },
    routes: { "/": { initialJsKb: 130 }, "/blog/*": { initialJsKb: 100 } },
  };

  it("merges route overrides onto the default, with * prefix matching", () => {
    expect(budgetFor(budgets, "/")).toEqual({ initialJsKb: 130, cssKb: 30 });
    expect(budgetFor(budgets, "/blog/a-post")).toEqual({ initialJsKb: 100, cssKb: 30 });
    expect(budgetFor(budgets, "/contact")).toEqual({ initialJsKb: 110, cssKb: 30 });
  });

  it("reports only measurements that exceed their budget", () => {
    const measurements = [
      { route: "/", jsBytes: 120 * 1024, cssBytes: 10 * 1024 },
      { route: "/contact", jsBytes: 115 * 1024, cssBytes: 31 * 1024 },
    ];

    expect(evaluateBudgets(measurements, budgets)).toEqual([
      { route: "/contact", metric: "initialJsKb", actualKb: 115, limitKb: 110 },
      { route: "/contact", metric: "cssKb", actualKb: 31, limitKb: 30 },
    ]);
  });

  it("throws when a route has no limit, so a config typo cannot disable the gate", () => {
    const typo = { default: { initialJSKb: 110, cssKb: 30 } };

    expect(() => evaluateBudgets([{ route: "/", jsBytes: 1, cssBytes: 1 }], typo)).toThrow(
      /No initialJsKb budget for \//,
    );
  });

  it("throws when there is nothing to measure", () => {
    expect(() => evaluateBudgets([], budgets)).toThrow(/No pages found/);
  });
});
