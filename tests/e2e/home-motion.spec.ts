import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { desktopOnly } from "./helpers";

/** Centre the element, so it is past the in-view trigger's bottom margin whatever its size. */
const scrollToCentre = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => el.scrollIntoView({ block: "center" }));

// Full motion: each home section starts from its start state once seen, runs
// once and settles on the same final content as the static HTML.

test.use({ reducedMotion: "no-preference" });

const hydrated = (page: Page) =>
  expect(page.getByRole("button", { name: "Motion" })).toHaveAttribute("aria-pressed", "true");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
});

test("the stack marquee scrolls, with an aria-hidden copy, and pauses on hover @smoke", async ({ page }) => {
  const track = page.locator(".marquee-track");

  await expect(track).toHaveCSS("animation-name", "marquee-scroll");
  await expect(page.locator(".marquee-copy")).toHaveAttribute("aria-hidden", "true");
  await page.locator(".marquee").hover();
  await expect(track).toHaveCSS("animation-play-state", "paused");
});

test("the stack marquee has a pause control that works by keyboard @smoke", async ({ page }) => {
  const pause = page.getByRole("checkbox", { name: "Pause scrolling" });
  const track = page.locator(".marquee-track");

  await pause.focus();
  await page.keyboard.press("Space");
  // Move focus away, so only the checkbox (not focus-within) can be holding the pause.
  await pause.evaluate((el) => el.blur());

  await expect(pause).toBeChecked();
  await expect(track).toHaveCSS("animation-play-state", "paused");
});

test("the page never scrolls sideways while sections animate", async ({ page }) => {
  await page.locator("#data-heading").scrollIntoViewIfNeeded();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe("once seen", () => {
  desktopOnly();

  test("the data facts count and decrypt into their real values", async ({ page }) => {
    const facts = page.locator("[data-fact-state]");
    await expect(facts.first()).toHaveAttribute("data-fact-state", "animating");
    // The real text stays in the accessibility tree throughout.
    await expect(page.getByText("Never", { exact: true })).toHaveCount(1);

    await scrollToCentre(page, "[data-fact-state]");

    await expect(page.locator('[data-fact-state="final"]')).toHaveCount(2);
    await expect(facts).toHaveText(["Never", "30"]);
  });

  test("the pipeline stages run queued → running → passed as each slides into view", async ({ page }) => {
    const stages = page.locator("[data-stage-state]");
    await expect(stages.first()).toHaveAttribute("data-stage-state", "queued");

    // Scroll through the pinned band the way a visitor would.
    const band = await page.locator("#how-we-work").evaluate((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      height: el.getBoundingClientRect().height,
    }));
    for (const at of [0.15, 0.35, 0.55, 0.75, 0.95]) {
      await page.evaluate((y) => window.scrollTo(0, y), band.top + band.height * at - 200);
      await page.waitForTimeout(250);
    }

    await expect(page.locator('[data-stage-state="passed"]')).toHaveCount(4, { timeout: 8000 });
  });

  test("the findings terminal types out every line, then holds", async ({ page }) => {
    const terminal = page.locator("[data-terminal-state]");
    await expect(terminal).toHaveAttribute("data-terminal-state", "armed");

    await scrollToCentre(page, "[data-terminal-state]");

    await expect(terminal).toHaveAttribute("data-terminal-state", "typing");
    await expect(terminal).toHaveAttribute("data-terminal-state", "final", { timeout: 6000 });
  });

  test("the border beam runs only while the field is hovered or focused", async ({ page }) => {
    const spinner = page.locator("#cta-email ~ .beam-ring .beam-spinner");
    await expect(spinner).toHaveCSS("animation-name", "none");

    await page.locator("#cta-email").focus();

    await expect(spinner).toHaveCSS("animation-name", "beam-spin");
  });

  test("has no axe violations with motion on", async ({ page }) => {
    for (const selector of ["[data-fact-state]", "[data-stage-state]", "[data-terminal-state]"]) {
      await scrollToCentre(page, selector);
    }
    await expect(page.locator("[data-terminal-state]")).toHaveAttribute("data-terminal-state", "final", {
      timeout: 6000,
    });
    // Scroll reveals would be measured mid-fade; they're covered by the reduced-motion run.
    await page.addStyleTag({
      content:
        ".reveal, .scroll-word, .assembly-slab, .assembly-rail, [data-hero] .hero-visual__layer, [data-hero] .hero-copy { animation: none !important; }",
    });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });
});

test.describe("below the band's minimum height", () => {
  // 600px tall: too short for the pinned band, so the pipeline is a plain 4-column row.
  test.use({ viewport: { width: 1024, height: 600 } });

  test("the pipeline keeps its height through the run (no layout shift)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "laptop-1024", "the status labels are tightest at 1024px");
    const list = page.locator("ol:has([data-stage-state])");
    await expect(list.locator("[data-stage-state]").first()).toHaveAttribute("data-stage-state", "queued");

    const heights = await list.evaluate(async (el) => {
      const seen = new Set<number>();
      el.scrollIntoView({ block: "center" });
      while (el.querySelectorAll('[data-stage-state="passed"]').length < 4) {
        seen.add(el.getBoundingClientRect().height);
        await new Promise(requestAnimationFrame);
      }
      return [...seen];
    });

    expect(heights).toHaveLength(1);
  });
});
