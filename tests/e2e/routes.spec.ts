import { expect, test } from "@playwright/test";
import urlBehaviour from "../fixtures/legacy/url-behaviour.json";
import { desktopOnly, isProdTarget, legacyPages } from "./helpers";

desktopOnly();

test("every legacy page responds 200 @smoke", async ({ request }) => {
  for (const legacy of legacyPages) {
    const response = await request.get(legacy.path, { maxRedirects: 0 });
    expect(response.status(), legacy.path).toBe(200);
  }
});

test("legacy assets referenced from outside the site still resolve", async ({ request }) => {
  const assets = [
    "/images/og.png",
    "/images/blog/spring-boot-scheduled-jobs-multiple-instances.png",
    "/images/blog/jobrunr-skipping-recurring-jobs.png",
    "/images/blog/firebase-auction-close-on-time.png",
    "/favicon.svg",
    "/apple-touch-icon.png",
    "/logo.svg",
    "/robots.txt",
    "/sitemap.xml",
    "/blog/feed.xml",
  ];
  for (const asset of assets) {
    expect((await request.get(asset)).status(), asset).toBe(200);
  }
});

test.describe("Cloudflare URL behaviour (static build)", () => {
  test.skip(!isProdTarget, "redirects and 404s only exist on the static server");

  for (const expected of urlBehaviour.responses) {
    test(`${expected.path} → ${expected.status}`, async ({ request, baseURL }) => {
      const response = await request.get(expected.path, { maxRedirects: 0 });

      expect(response.status()).toBe(expected.status);
      if ("location" in expected) {
        expect(new URL(response.headers().location, baseURL).pathname).toBe(expected.location);
      }
    });
  }
});

test("unknown paths show the 404 page", async ({ page }) => {
  const response = await page.goto("/route-that-never-existed");

  if (isProdTarget) expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page doesn’t exist.");
});
