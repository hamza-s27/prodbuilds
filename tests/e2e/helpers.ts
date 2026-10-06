import { test, type Page } from "@playwright/test";
import inventory from "../fixtures/legacy/inventory.json";

export type LegacyPage = (typeof inventory.pages)[number];
export const legacyPages: readonly LegacyPage[] = inventory.pages;

const CROSS_BROWSER = new Set(["firefox", "webkit"]);

/**
 * Viewport-independent checks only need one Chromium project. Tests tagged
 * @smoke also run on the firefox and webkit projects (desktop-sized).
 */
export function desktopOnly(): void {
  // Playwright requires a destructuring pattern for the fixtures argument.
  test.beforeEach(({}, testInfo) => {
    const isSmokeRun = CROSS_BROWSER.has(testInfo.project.name) && testInfo.tags.includes("@smoke");
    testInfo.skip(testInfo.project.name !== "desktop-1440" && !isSmokeRun, "runs on desktop-1440 only");
  });
}

export const isProdTarget = process.env.PW_TARGET === "prod";

/** Plain-object view of the <head> tags the legacy inventory records. */
export async function readHead(page: Page) {
  return page.evaluate(() => {
    const meta = (selector: string) => document.querySelector(selector)?.getAttribute("content") ?? null;
    const group = (attribute: string, prefix: string) =>
      Object.fromEntries(
        [...document.querySelectorAll(`meta[${attribute}^="${prefix}"]`)].map((el) => [
          el.getAttribute(attribute),
          el.getAttribute("content"),
        ]),
      );
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      keywords: meta('meta[name="keywords"]'),
      author: meta('meta[name="author"]'),
      robots: meta('meta[name="robots"]'),
      themeColor: meta('meta[name="theme-color"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      rssHref:
        document.querySelector('link[rel="alternate"][type="application/rss+xml"]')?.getAttribute("href") ??
        null,
      og: group("property", "og:"),
      twitter: group("name", "twitter:"),
      article: group("property", "article:"),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) =>
        JSON.parse(el.textContent ?? "null"),
      ),
      ids: [...document.querySelectorAll("[id]")].map((el) => el.id),
      h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
    };
  });
}
