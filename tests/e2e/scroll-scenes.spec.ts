import { expect, type Page, test } from "@playwright/test";
import { desktopOnly } from "./helpers";

// Scroll scenes (src/styles/scroll-scenes.css): CSS scroll timelines, so
// Chromium only here; reduced-motion.spec.ts covers the static fallback.

desktopOnly();
test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "chromium", "scroll-driven animations");
});

const opacityOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

/** Scroll so the element's top sits `offset` px below the viewport top, then let a frame render. */
async function scrollTo(page: Page, selector: string, offset = 0) {
  await page
    .locator(selector)
    .first()
    .evaluate((el, by) => {
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - by);
    }, offset);
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

test("leaving the hero, the copy lifts away and the scene recedes (the pause button doesn't)", async ({
  page,
}) => {
  await page.goto("/");
  expect(await opacityOf(page, ".hero-copy")).toBe(1);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.6));
  await page.evaluate(() => new Promise(requestAnimationFrame));

  await expect.poll(() => opacityOf(page, ".hero-copy")).toBeLessThan(0.8);
  await expect.poll(() => opacityOf(page, ".hero-visual__layer")).toBeLessThan(1);
  // The box holding the pause button never animates, so it never traps the button under the copy.
  await expect(page.locator(".hero-visual")).toHaveCSS("animation-name", "none");
});

test("section headings light up word by word as they rise", async ({ page }) => {
  await page.goto("/");
  const firstWord = "#blog-heading .scroll-word";
  expect(await opacityOf(page, firstWord)).toBeLessThan(0.5);

  await scrollTo(page, "#blog-heading", 150);

  await expect.poll(() => opacityOf(page, firstWord)).toBe(1);
  await expect(page.locator("#blog-heading")).toHaveText("Engineering notes.");
});

test("the services stack builds slab by slab as the rows scroll through", async ({ page }) => {
  await page.goto("/");
  const deepest = '.assembly-slab[data-layer="cloud"]';
  await scrollTo(page, ".stack-row", 200);
  expect(await opacityOf(page, deepest)).toBeLessThan(0.3);

  await scrollTo(page, '.stack-row[data-layer="ai"]', 200);

  await expect.poll(() => opacityOf(page, deepest)).toBeGreaterThan(0.7);
});

test("the process section pins and its stages slide sideways", async ({ page }) => {
  await page.goto("/");
  const band = await page.locator("#how-we-work").evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    top: el.getBoundingClientRect().top + window.scrollY,
  }));
  const viewport = page.viewportSize()!;
  expect(band.height).toBeGreaterThan(viewport.height * 2);

  await page.evaluate((y) => window.scrollTo(0, y), band.top + band.height * 0.6);
  await page.evaluate(() => new Promise(requestAnimationFrame));

  await expect
    .poll(() =>
      page.locator(".hband-track").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBeLessThan(-100);
  await expect(page.locator("#how-heading")).toBeInViewport();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the process section is ordinary flow, not a pinned band", async ({ page }) => {
    await page.goto("/");
    const height = await page.locator("#how-we-work").evaluate((el) => el.getBoundingClientRect().height);

    expect(height).toBeLessThan(page.viewportSize()!.height * 1.5);
    await expect(page.locator(".hband-track")).toHaveCSS("transform", "none");
  });
});
