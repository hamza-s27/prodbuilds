// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { headersFor, parseHeadersFile } from "./parse-headers.mjs";
import { buildCsp, buildHeadersFile, inlineScriptHashes } from "./security-headers.mjs";

const ENDPOINT = "https://script.google.com/macros/s/ABC/exec";
const sha = (text) => `'sha256-${createHash("sha256").update(text).digest("base64")}'`;

describe("inlineScriptHashes", () => {
  it("hashes inline executable scripts only, once each", () => {
    const html = `
      <script>self.__next_f=[]</script>
      <script>self.__next_f=[]</script>
      <script src="/_next/a.js"></script>
      <script type="application/ld+json">{"@context":"https://schema.org"}</script>
      <script async="">push(1)</script>
      <script data-src="x">push(2)</script>`;

    expect(inlineScriptHashes(html)).toEqual([sha("self.__next_f=[]"), sha("push(1)"), sha("push(2)")]);
  });
});

describe("buildCsp", () => {
  const csp = buildCsp(["'sha256-abc='"], ENDPOINT);

  it("allows only same-origin and hashed scripts", () => {
    expect(csp).toContain("script-src 'self' 'sha256-abc='");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });

  it("lets the lead form reach only its own Apps Script endpoint, plus Google's redirect host", () => {
    const allowed = `'self' ${ENDPOINT} https://script.googleusercontent.com`;
    expect(csp).toContain(`connect-src ${allowed}`);
    expect(csp).toContain(`form-action ${allowed}`);
    expect(csp).not.toMatch(/https:\/\/script\.google\.com[ ;]/);
  });

  it("locks down framing, plugins and the base URL", () => {
    for (const directive of [
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "default-src 'self'",
    ]) {
      expect(csp).toContain(directive);
    }
  });
});

describe("buildHeadersFile", () => {
  const file = buildHeadersFile(
    [
      { route: "/", hashes: ["'sha256-a='"] },
      { route: "/services", hashes: ["'sha256-b='"] },
    ],
    ENDPOINT,
  );
  const rules = parseHeadersFile(file);

  it("applies baseline security headers everywhere", () => {
    const headers = headersFor(rules, "/anything");
    // No includeSubDomains until every *.prodbuilds.com host is known to be HTTPS-only.
    expect(headers["strict-transport-security"]).toBe("max-age=31536000");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });

  it("gives unknown paths (the 404 page) a script-less baseline CSP", () => {
    const baseline = headersFor(rules, "/no-such-page")["content-security-policy"];
    expect(baseline).toContain("object-src 'none'");
    expect(baseline).toContain("frame-ancestors 'none'");
    expect(baseline).not.toContain("script-src");
  });

  it("gives each route its own CSP, never merged with another route's", () => {
    expect(headersFor(rules, "/")["content-security-policy"]).toContain("'sha256-a='");
    expect(headersFor(rules, "/")["content-security-policy"]).not.toContain("'sha256-b='");
    expect(headersFor(rules, "/services")["content-security-policy"]).toContain("'sha256-b='");
  });

  it("caches hashed build assets forever and leaves HTML to the host default", () => {
    expect(headersFor(rules, "/_next/static/chunks/a.js")["cache-control"]).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(headersFor(rules, "/services")["cache-control"]).toBeUndefined();
  });
});
