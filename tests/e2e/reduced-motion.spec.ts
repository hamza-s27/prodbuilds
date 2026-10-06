import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// With reduced motion (OS) or the footer toggle off, every home section shows
// its final content and nothing animates. Plan §7.

const MODES = [
  {
    name: "OS reduced motion",
    setup: (page: Page) => page.emulateMedia({ reducedMotion: "reduce" }),
    hydrated: (page: Page) => expect(page.getByText("Motion off · system setting")).toBeVisible(),
  },
  {
    name: "motion toggle off",
    setup: (page: Page) => page.addInitScript(() => localStorage.setItem("pb-motion", "off")),
    hydrated: (page: Page) =>
      expect(page.getByRole("button", { name: "Motion" })).toHaveAttribute("aria-pressed", "false"),
  },
] as const;

/** Scroll the whole page so every in-view trigger has had its chance to fire. */
async function scrollThrough(page: Page) {
  for (const id of ["#services-heading", "#data-heading", "#how-heading", "#blog-heading", "#cta-heading"]) {
    await page.locator(id).scrollIntoViewIfNeeded();
  }
}

for (const mode of MODES) {
  test.describe(`home with ${mode.name} @smoke`, () => {
    test.beforeEach(async ({ page }) => {
      await mode.setup(page);
      await page.goto("/");
      await mode.hydrated(page);
      await scrollThrough(page);
    });

    test("every section shows its final content", async ({ page }) => {
      await expect(page.locator("[data-fact-state]")).toHaveText(["Never", "30"]);
      await expect(page.locator('[data-fact-state="animating"]')).toHaveCount(0);
      await expect(page.locator("[data-stage-state]")).toHaveCount(4);
      await expect(page.locator('[data-stage-state]:not([data-stage-state="passed"])')).toHaveCount(0);
      const terminal = page.locator("[data-terminal-state]");
      await expect(terminal).toHaveAttribute("data-terminal-state", "final");
      await expect(terminal).toContainText("1 closed, 4 already-closed");
      await expect(page.locator(".marquee-copy")).toBeHidden();
      await expect(page.getByRole("checkbox", { name: "Pause scrolling" })).toBeHidden();
      await expect(page.getByRole("list", { name: "Technologies we work with" })).toBeVisible();
    });

    test("nothing animates", async ({ page }) => {
      await page.locator("#cta-email").hover();
      await page.locator("#cta-email").focus();

      const animated = await page.evaluate(async () => {
        // Focus changes start 0.01 ms transitions (globals.css); let them finish.
        for (let frame = 0; frame < 2; frame += 1) await new Promise(requestAnimationFrame);
        const names = [
          [".marquee-track", null],
          [".terminal-cursor", "::after"],
          [".beam-spinner", null],
          [".pipeline-node", "::after"],
        ].flatMap(([selector, pseudo]) =>
          [...document.querySelectorAll(selector!)].map((el) => getComputedStyle(el, pseudo).animationName),
        );
        const running = document
          .getAnimations()
          .filter((animation) => animation.playState === "running")
          .map((animation) => (animation as CSSAnimation).animationName ?? animation.constructor.name);
        return { names: [...new Set(names)], running };
      });

      expect(animated).toEqual({ names: ["none"], running: [] });
    });

    test("has no axe violations", async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual(
        [],
      );
    });
  });
}
