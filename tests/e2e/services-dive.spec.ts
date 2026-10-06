import { expect, type Page, test } from "@playwright/test";

// The /services stack dive: sections in normal flow, a sticky stack
// navigation from 1024px that follows the section crossing the viewport centre.

const LAYERS = ["product", "backend", "scaling", "automation", "cloud", "ai"] as const;

const isWide = (projectName: string) => projectName === "laptop-1024" || projectName === "desktop-1440";
const stackNav = (page: Page) => page.getByRole("navigation", { name: "Layers of the stack" });

/** Bottom edge of the sticky site header, in viewport px. */
const headerBottom = (page: Page) =>
  page
    .locator("header")
    .first()
    .evaluate((el) => el.getBoundingClientRect().bottom);

test.describe("from 1024px", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!isWide(testInfo.project.name), "the stack navigation only shows from 1024px");
  });

  for (const id of LAYERS) {
    test(`/services#${id} shows the heading below the header and marks the layer active`, async ({
      page,
    }) => {
      await page.goto(`/services#${id}`);

      const heading = page.locator(`#${id}-heading`);
      await expect(heading).toBeInViewport();
      const top = await heading.evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(await headerBottom(page));
      await expect(stackNav(page)).toHaveAttribute("data-active-layer", id);
      await expect(stackNav(page).locator(`a[href="#${id}"]`)).toHaveAttribute("aria-current", "true");
    });
  }

  test("following a layer link moves to its section and the gauge follows @smoke", async ({ page }) => {
    await page.goto("/services");

    await stackNav(page)
      .getByRole("link", { name: /Cloud infrastructure/ })
      .click();

    await expect(page).toHaveURL(/#cloud$/);
    await expect(page.locator("#cloud-heading")).toBeInViewport();
    await expect(stackNav(page)).toHaveAttribute("data-active-layer", "cloud");
  });

  test("the navigation sticks at the same spot while scrolling through the sections", async ({ page }) => {
    await page.goto("/services#backend");
    const navTop = () => stackNav(page).evaluate((el) => Math.round(el.getBoundingClientRect().top));
    const first = await navTop();

    await page.locator("#automation").evaluate((el) => el.scrollIntoView({ block: "center" }));

    await expect(stackNav(page)).toHaveAttribute("data-active-layer", "automation");
    expect(await navTop()).toBe(first);
    await expect(stackNav(page)).toBeInViewport({ ratio: 1 });
  });

  test("keyboard focus in the stack navigation is visible and never under the header", async ({ page }) => {
    await page.goto("/services#scaling");
    // Reach the first link by keyboard (Shift+Tab, Tab), so it's :focus-visible in every engine.
    await stackNav(page).getByRole("link").nth(1).focus();
    await page.keyboard.press("Shift+Tab");

    for (let i = 0; i < 6; i += 1) {
      const focused = page.locator(":focus");
      await expect(focused).toBeInViewport();
      const box = await focused.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top, outline: getComputedStyle(el).outlineStyle };
      });
      expect(box.top).toBeGreaterThanOrEqual(await headerBottom(page));
      expect(box.outline).not.toBe("none");
      if (i < 5) await page.keyboard.press("Tab");
    }
  });

  test("layout stays put while loading a deep link (CLS < 0.1)", async ({ page }) => {
    await page.goto("/services#backend");
    await expect(stackNav(page)).toHaveAttribute("data-active-layer", "backend");

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as unknown as {
              value: number;
              hadRecentInput: boolean;
            }[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );

    expect(cls).toBeLessThan(0.1);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the navigation still tracks the layer, and nothing animates", async ({ page }) => {
      await page.goto("/services#scaling");

      await expect(stackNav(page)).toHaveAttribute("data-active-layer", "scaling");
      const running = await page.evaluate(async () => {
        for (let frame = 0; frame < 2; frame += 1) await new Promise(requestAnimationFrame);
        return document.getAnimations().filter((animation) => animation.playState === "running").length;
      });
      expect(running).toBe(0);
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the layer links still work as plain anchors", async ({ page }) => {
      await page.goto("/services");

      await stackNav(page)
        .getByRole("link", { name: /AI integrations/ })
        .click();

      await expect(page.locator("#ai-heading")).toBeInViewport();
    });
  });
});

test.describe("on a very tall screen", () => {
  test.use({ viewport: { width: 1440, height: 2000 } });
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "one viewport size is enough");
  });

  for (const id of ["product", "ai"] as const) {
    test(`/services#${id} marks the section it lands on`, async ({ page }) => {
      await page.goto(`/services#${id}`);

      await expect(stackNav(page)).toHaveAttribute("data-active-layer", id);
    });
  }
});

test.describe("on a short screen", () => {
  test.use({ viewport: { width: 1024, height: 480 } });
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "laptop-1024", "one viewport size is enough");
  });

  test("every layer link can be reached and is fully visible when focused", async ({ page }) => {
    await page.goto("/services#backend");
    const links = stackNav(page).getByRole("link");

    for (let i = 0; i < 6; i += 1) {
      await links.nth(i).focus();
      await expect(links.nth(i)).toBeInViewport({ ratio: 1 });
      const top = await links.nth(i).evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(await headerBottom(page));
    }
  });
});

test.describe("below 1024px", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(isWide(testInfo.project.name), "phones and tablets get a glyph per section instead");
  });

  test("each section shows its own stack glyph and there is no sticky navigation", async ({ page }) => {
    await page.goto("/services#cloud");

    await expect(stackNav(page)).toBeHidden();
    await expect(page.locator("#cloud svg").first()).toBeVisible();
    await expect(page.locator("#cloud-heading")).toBeInViewport();
  });
});
