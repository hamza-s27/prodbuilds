import { expect, test } from "@playwright/test";
import { expectedJsonLd } from "../fixtures/expected-legacy";
import { desktopOnly, legacyPages, readHead } from "./helpers";

desktopOnly();

/**
 * Next resolves the root URL to the bare origin ("https://prodbuilds.com"); the
 * legacy site wrote "https://prodbuilds.com/". Same resource (RFC 3986 §6.2.3).
 */
const normaliseRoot = (url: string | null | undefined) =>
  url?.replace(/^(https:\/\/prodbuilds\.com)\/$/, "$1");
const withRootNormalised = (tags: Record<string, string | null>) =>
  Object.fromEntries(Object.entries(tags).map(([key, value]) => [key, normaliseRoot(value) ?? value]));

for (const legacy of legacyPages) {
  test.describe(`SEO parity ${legacy.path}`, () => {
    test("head tags match the legacy page", async ({ page }) => {
      await page.goto(legacy.path);
      const head = await readHead(page);

      expect(head.title).toBe(legacy.title);
      expect(head.description).toBe(legacy.description);
      expect(head.keywords).toBe(legacy.keywords);
      expect(head.author).toBe(legacy.author);
      expect(head.robots).toBe(legacy.robots);
      expect(head.themeColor?.toLowerCase()).toBe(legacy.themeColor?.toLowerCase());
      expect(normaliseRoot(head.canonical)).toBe(normaliseRoot(legacy.canonical));
      expect(head.rssHref).toBe(legacy.rssHref);
      expect(withRootNormalised(head.og)).toMatchObject(withRootNormalised(legacy.og));
      expect(head.twitter).toMatchObject(legacy.twitter);
      expect(head.article).toMatchObject(legacy.article);
    });

    test("structured data, h1 and every legacy id survive", async ({ page }) => {
      await page.goto(legacy.path);
      const head = await readHead(page);

      expect(head.jsonLd).toEqual(expectedJsonLd(legacy.path));
      expect(head.h1).toBe(legacy.h1);
      expect(head.ids).toEqual(expect.arrayContaining(legacy.ids));
    });
  });
}
