import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { legacyPages } from "./helpers";

const PATHS = [...legacyPages.map((page) => page.path), "/route-that-never-existed"];

// Scroll reveals fade content in; axe would measure contrast mid-fade. Reduced
// motion renders every element in its final state.
test.use({ reducedMotion: "reduce" });

for (const path of PATHS) {
  test(`${path} has no axe violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });

  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("the skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/services");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.locator("main#main-content")).toBeFocused();
});

test("the open mobile menu is accessible and marks the current section", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320", "the disclosure menu only exists below 768px");
  await page.goto("/blog/jobrunr-skipping-recurring-jobs");

  await page.getByText("Menu", { exact: true }).click();
  const menuBlogLink = page.locator("details[open]").getByRole("link", { name: /Blog/ });

  await expect(menuBlogLink).toHaveAttribute("aria-current", "true");
  const results = await new AxeBuilder({ page }).include("header").analyze();
  expect(results.violations).toEqual([]);
});
