import { expect, test } from "@playwright/test";
import { desktopOnly } from "./helpers";

desktopOnly();

const POST = "/blog/spring-boot-scheduled-jobs-multiple-instances";

test("code blocks are highlighted at build time and keyboard-scrollable", async ({ page }) => {
  await page.goto(POST);

  const firstBlock = page.locator("article pre").first();
  await expect(firstBlock).toHaveAttribute("tabindex", "0");
  await expect(firstBlock.locator("span[style*='color']").first()).toBeVisible();
});

test("the results table sits in a named, focusable region", async ({ page }) => {
  await page.goto(POST);

  await expect(page.getByRole("region", { name: "Test results" })).toHaveAttribute("tabindex", "0");
});

test("heading anchors keep clean heading names and unique link names", async ({ page }) => {
  await page.goto(POST);

  await expect(page.getByRole("heading", { level: 2, name: "In short", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Link to section: In short" })).toHaveAttribute(
    "href",
    "#in-short",
  );
  await expect(page.getByRole("region", { name: "In short", exact: true })).toBeVisible();
});

test("diagram labels keep their own colours (ink on bars stays dark)", async ({ page }) => {
  await page.goto(POST);

  const fills = await page.evaluate(() => {
    const fill = (selector: string) => {
      const el = document.querySelector(selector);
      return el ? getComputedStyle(el).fill : null;
    };
    return {
      ink: fill(".diagram text.d-ink"),
      title: fill(".diagram text.d-title"),
      body: fill(".diagram text:not([class])"),
    };
  });

  expect(fills.ink).toBe("rgb(12, 12, 15)");
  expect(fills.title).toBe("rgb(28, 180, 149)");
  expect(fills.body).toBe("rgb(200, 199, 194)");
});
