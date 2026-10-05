import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { expect, type Page, test } from "@playwright/test";
import { desktopOnly, isProdTarget } from "./helpers";

desktopOnly();
test.skip(!isProdTarget, "chunk loading and sizes are only meaningful in the static build");

const LANDING_JS_BUDGET_KB = 150;
const heroVisual = (page: Page) => page.locator(".hero-visual");

/** Headless Chromium only has software WebGL, which production refuses on purpose. */
const allowSoftwareWebGL = (page: Page) =>
  page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__PB_ALLOW_SOFTWARE_WEBGL__ = true;
  });

function scriptUrls(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") urls.push(new URL(request.url()).pathname);
  });
  return urls;
}

test("with reduced motion the poster stays and the WebGL chunk never loads", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await allowSoftwareWebGL(page);
  const requested = scriptUrls(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "off");
  await expect(page.getByRole("button", { name: "Pause animation" })).toHaveCount(0);
  const initial = await page.evaluate(() =>
    [...document.querySelectorAll("script[src]")].map((s) => new URL((s as HTMLScriptElement).src).pathname),
  );
  expect(requested.filter((url) => !initial.includes(url))).toEqual([]);
});

test("without usable WebGL the poster is the fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      return type.startsWith("webgl") ? null : original.call(this, type as "2d", ...(rest as []));
    } as typeof original;
  });
  await page.goto("/");

  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "fallback");
});

test("the pillar runs after idle, pauses offscreen and on request", async ({ page }) => {
  await allowSoftwareWebGL(page);
  await page.goto("/");

  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "running", { timeout: 15_000 });
  await expect(page.locator("[data-hero]")).toHaveAttribute("data-hero-motion", "running");

  await page.locator("#blog-heading").scrollIntoViewIfNeeded();
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "paused");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "running");

  const pause = page.getByRole("button", { name: "Pause animation" });
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "paused");
});

test("the footer motion switch turns the pillar off and is remembered", async ({ page }) => {
  await allowSoftwareWebGL(page);
  await page.goto("/");
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "running", { timeout: 15_000 });

  const motion = page.getByRole("button", { name: "Motion", exact: true });
  await expect(motion).toHaveAttribute("aria-pressed", "true");
  await motion.click();
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "off");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "off");
  await expect(page.getByRole("button", { name: "Motion", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("the headline, not the visual, is the largest contentful paint", async ({ page }) => {
  await page.goto("/");

  const lcpElementId = await page.evaluate(
    () =>
      new Promise<string | null>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as (PerformanceEntry & { element?: Element })[];
          resolve(entries.at(-1)?.element?.id ?? entries.at(-1)?.element?.closest("[id]")?.id ?? null);
        }).observe({ type: "largest-contentful-paint", buffered: true });
      }),
  );

  expect(lcpElementId).toBe("hero-heading");
});

test(`home ships at most ${LANDING_JS_BUDGET_KB} kb of JS, including the lazy WebGL chunk`, async ({
  page,
}) => {
  await allowSoftwareWebGL(page);
  const requested = scriptUrls(page);
  await page.goto("/");
  await expect(heroVisual(page)).toHaveAttribute("data-render-state", "running", { timeout: 15_000 });

  const gzippedKb =
    [...new Set(requested)]
      .map((url) => gzipSync(readFileSync(resolve("out", `.${url}`))).length)
      .reduce((sum, size) => sum + size, 0) / 1024;

  console.log(`home JS incl. lazy chunks: ${gzippedKb.toFixed(1)} kb gz`);
  expect(gzippedKb).toBeLessThanOrEqual(LANDING_JS_BUDGET_KB);
});
