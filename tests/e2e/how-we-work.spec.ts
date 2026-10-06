import { expect, test } from "@playwright/test";
import { desktopOnly } from "./helpers";

desktopOnly();

test("the hero's principles links land on the principles bento", async ({ page }) => {
  await page.goto("/how-we-work#principles");

  await expect(page.locator("#principles-heading")).toBeInViewport();
  await expect(page.locator("#principles li")).toHaveCount(6);
});

test("closed FAQ answers are in the HTML, for search and find-in-page", async ({ request }) => {
  const html = await (await request.get("/how-we-work")).text();

  // Every <details> but the first is closed in the static HTML.
  expect((html.match(/<details/g) ?? []).length).toBeGreaterThan(2);
  expect((html.match(/<details[^>]*\sopen/g) ?? []).length).toBe(1);
  expect(html).toContain("set out in the written agreement for your project");
});

test("opening one FAQ answer closes the other @smoke", async ({ page }) => {
  await page.goto("/how-we-work");
  const items = page.locator("details.faq-item");
  await expect(items.first()).toHaveAttribute("open", "");

  await items.nth(1).locator("summary").press("Enter");

  await expect(items.nth(1)).toHaveAttribute("open", "");
  await expect(items.first()).not.toHaveAttribute("open");
});

test.describe("timeline beam", () => {
  test("fills as you read, lighting each step's node once it is passed", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "scroll-driven animations");
    await page.goto("/how-we-work");
    await page.locator("#step-3").evaluate((el) => el.scrollIntoView({ block: "center" }));

    const state = await page.evaluate(async () => {
      for (let frame = 0; frame < 3; frame += 1) await new Promise(requestAnimationFrame);
      const fill = document.querySelector(".timeline-beam-fill")!;
      const scale = new DOMMatrix(getComputedStyle(fill).transform).d;
      const nodes = [...document.querySelectorAll(".timeline-node")].map((node) =>
        Number(getComputedStyle(node, "::after").opacity),
      );
      return { scale, nodes };
    });

    // The fill's tip sits at the viewport centre, which is where step 3's node now is.
    const tipY = await page.evaluate(() => {
      const beam = document.querySelector(".timeline-beam")!.getBoundingClientRect();
      const fill = new DOMMatrix(getComputedStyle(document.querySelector(".timeline-beam-fill")!).transform)
        .d;
      return beam.top + beam.height * fill;
    });
    const nodeY = await page
      .locator(".timeline-node")
      .nth(2)
      .evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
    expect(Math.abs(tipY - nodeY)).toBeLessThan(40);
    expect(state.scale).toBeGreaterThan(0.3);
    expect(state.nodes.slice(0, 2)).toEqual([1, 1]);
    expect(state.nodes[3]).toBe(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("is a full static beam", async ({ page }) => {
      await page.goto("/how-we-work");

      await expect(page.locator(".timeline-beam-fill")).toBeHidden();
      await expect(page.locator(".timeline-beam")).toHaveCSS("background-image", /linear-gradient/);
    });
  });
});
