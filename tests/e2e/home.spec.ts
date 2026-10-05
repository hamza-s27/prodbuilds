import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page renders the headline @smoke", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toHaveText(
    "Software that holds up in production.",
  );
});

test("home page has no horizontal overflow", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});

test("home page has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
