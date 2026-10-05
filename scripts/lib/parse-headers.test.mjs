// @vitest-environment node
import { describe, expect, it } from "vitest";
import { headersFor, parseHeadersFile } from "./parse-headers.mjs";

const SAMPLE = `# global
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/services
  Content-Security-Policy: default-src 'self'

/blog/:slug
  X-Robots-Tag: all
  ! Referrer-Policy
`;

describe("parseHeadersFile", () => {
  it("parses rules, headers and detach lines, skipping comments and blanks", () => {
    const rules = parseHeadersFile(SAMPLE);

    expect(rules).toHaveLength(4);
    expect(rules[0]).toEqual({
      pattern: "/*",
      set: [
        ["X-Content-Type-Options", "nosniff"],
        ["Referrer-Policy", "strict-origin-when-cross-origin"],
      ],
      detach: [],
    });
    expect(rules[3].detach).toEqual(["Referrer-Policy"]);
  });

  it("throws on a header line before any URL pattern", () => {
    expect(() => parseHeadersFile("  X-Test: 1\n")).toThrow(/before a URL pattern/);
  });

  it("enforces Cloudflare's limits of 100 rules and 2,000 characters per line", () => {
    const tooManyRules = Array.from({ length: 101 }, (_, i) => `/r${i}\n  X-A: 1`).join("\n");
    const longLine = `/*\n  X-Long: ${"a".repeat(2000)}\n`;

    expect(() => parseHeadersFile(tooManyRules)).toThrow(/100 rules/);
    expect(() => parseHeadersFile(longLine)).toThrow(/2000 characters/);
  });
});

describe("headersFor", () => {
  const rules = parseHeadersFile(SAMPLE);

  it("applies splat rules to every path", () => {
    expect(headersFor(rules, "/")).toEqual({
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
    });
  });

  it("merges every matching rule in order", () => {
    expect(headersFor(rules, "/services")).toMatchObject({
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'self'",
    });
    expect(headersFor(rules, "/_next/static/chunks/a.js")["cache-control"]).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("matches :placeholders against a single segment and honours detach", () => {
    const blog = headersFor(rules, "/blog/some-post");

    expect(blog["x-robots-tag"]).toBe("all");
    expect(blog["referrer-policy"]).toBeUndefined();
    expect(headersFor(rules, "/blog/a/b")["x-robots-tag"]).toBeUndefined();
  });

  it("joins a header set by several matching rules with a comma, as Cloudflare does", () => {
    const joined = parseHeadersFile(
      `/*\n  Cache-Control: max-age=0\n/static/*\n  Cache-Control: immutable\n`,
    );

    expect(headersFor(joined, "/static/a.js")["cache-control"]).toBe("max-age=0, immutable");
  });

  it("does not match a rule for a different path", () => {
    expect(headersFor(rules, "/contact")["content-security-policy"]).toBeUndefined();
  });
});
