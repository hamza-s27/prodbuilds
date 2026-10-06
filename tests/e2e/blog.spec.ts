import { expect, test } from "@playwright/test";
import { desktopOnly, isProdTarget } from "./helpers";

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

test("the table of contents marks the section a deep link lands on @smoke", async ({ page }) => {
  await page.goto(`${POST}#lock-at-least-for`);
  const toc = page.getByRole("navigation", { name: "On this page" });

  await expect(toc.getByRole("link")).toHaveCount(9);
  await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#lock-at-least-for");
});

test("each code block has a copy button that copies its code", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only in Playwright");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(POST);
  const block = page.locator(".code-block").first();

  await block.getByRole("button", { name: "Copy code" }).click();

  await expect(block.getByRole("status")).toHaveText("Copied");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await block.locator("pre").textContent());
});

test("posts link to the previous and next post", async ({ page }) => {
  await page.goto("/blog/jobrunr-skipping-recurring-jobs");
  const pager = page.getByRole("navigation", { name: "More posts" });

  await expect(pager.getByRole("link", { name: /Previous post/ })).toHaveAttribute(
    "href",
    "/blog/firebase-auction-close-on-time",
  );
  await expect(pager.getByRole("link", { name: /Next post/ })).toHaveAttribute(
    "href",
    "/blog/spring-boot-scheduled-jobs-multiple-instances",
  );
});

test("a post loads no script after the initial ones (no animation runtime)", async ({ page }) => {
  test.skip(!isProdTarget, "the dev server loads chunks on demand");
  const requested: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") requested.push(new URL(request.url()).pathname);
  });
  await page.goto(POST);
  await page.waitForLoadState("networkidle");
  // The scripts the HTML itself asks for, read before anything could add more.
  const initial = await page.evaluate(() =>
    [...document.querySelectorAll("script[src]")].map((s) => new URL((s as HTMLScriptElement).src).pathname),
  );

  await page.mouse.wheel(0, 4000);
  await page.waitForLoadState("networkidle");

  expect(requested.filter((url) => !initial.includes(url))).toEqual([]);
});

test("jumping back to the top from the end updates the table of contents", async ({ page }) => {
  await page.goto(`${POST}#checklist`);
  const toc = page.getByRole("navigation", { name: "On this page" });
  await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#checklist");

  await toc.getByRole("link", { name: "In short" }).click();

  await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#in-short");
});
