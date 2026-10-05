// @vitest-environment node
import { describe, expect, it } from "vitest";
import { resolveRequest } from "./resolve-request.mjs";

const FILES = new Set([
  "index.html",
  "services.html",
  "blog.html",
  "blog/feed.xml",
  "blog/firebase-auction-close-on-time.html",
  "docs/index.html",
  "logo.svg",
  "404.html",
]);
const exists = (file) => FILES.has(file);

describe("resolveRequest (Cloudflare Pages clean URLs)", () => {
  it("serves index.html at the root", () => {
    expect(resolveRequest("/", exists)).toEqual({ type: "file", file: "index.html" });
  });

  it("serves a page's .html file at its clean URL", () => {
    expect(resolveRequest("/services", exists)).toEqual({ type: "file", file: "services.html" });
  });

  it("serves nested pages at their clean URL", () => {
    expect(resolveRequest("/blog/firebase-auction-close-on-time", exists)).toEqual({
      type: "file",
      file: "blog/firebase-auction-close-on-time.html",
    });
  });

  it("serves static assets as-is", () => {
    expect(resolveRequest("/logo.svg", exists)).toEqual({ type: "file", file: "logo.svg" });
    expect(resolveRequest("/blog/feed.xml", exists)).toEqual({ type: "file", file: "blog/feed.xml" });
  });

  it("redirects /index.html to / with 308", () => {
    expect(resolveRequest("/index.html", exists)).toEqual({ type: "redirect", status: 308, location: "/" });
  });

  it("redirects .html URLs to the clean URL with 308", () => {
    expect(resolveRequest("/services.html", exists)).toEqual({
      type: "redirect",
      status: 308,
      location: "/services",
    });
  });

  it("redirects a trailing slash to the clean URL when the page is a file", () => {
    expect(resolveRequest("/blog/", exists)).toEqual({ type: "redirect", status: 308, location: "/blog" });
  });

  it("serves directory indexes at the slash URL and redirects the bare URL to it", () => {
    expect(resolveRequest("/docs/", exists)).toEqual({ type: "file", file: "docs/index.html" });
    expect(resolveRequest("/docs", exists)).toEqual({ type: "redirect", status: 308, location: "/docs/" });
  });

  it("redirects /index and /dir/index to their directory URL", () => {
    expect(resolveRequest("/index", exists)).toEqual({ type: "redirect", status: 308, location: "/" });
    expect(resolveRequest("/docs/index", exists)).toEqual({
      type: "redirect",
      status: 308,
      location: "/docs/",
    });
  });

  it("never serves Cloudflare config files", () => {
    const withConfig = (file) => file === "_headers" || file === "_redirects" || exists(file);

    expect(resolveRequest("/_headers", withConfig)).toEqual({ type: "not-found" });
    expect(resolveRequest("/_redirects", withConfig)).toEqual({ type: "not-found" });
  });

  it("returns not-found for unknown paths", () => {
    expect(resolveRequest("/does-not-exist", exists)).toEqual({ type: "not-found" });
  });

  it("rejects path traversal", () => {
    expect(resolveRequest("/../package.json", exists)).toEqual({ type: "not-found" });
    expect(resolveRequest("/%2e%2e/package.json", exists)).toEqual({ type: "not-found" });
  });

  it("treats malformed percent-encoding as not-found", () => {
    expect(resolveRequest("/%E0%A4%A", exists)).toEqual({ type: "not-found" });
  });
});
