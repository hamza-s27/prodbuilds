import { expect, test } from "@playwright/test";
import { desktopOnly, isProdTarget, legacyPages } from "./helpers";

desktopOnly();
test.skip(!isProdTarget, "CSP comes from out/_headers on the static server");

for (const legacy of legacyPages) {
  test(`${legacy.path} runs under its CSP without violations`, async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy/i.test(message.text())) violations.push(message.text());
    });

    const response = await page.goto(legacy.path);
    await page.waitForLoadState("networkidle");

    expect(response?.headers()["content-security-policy"]).toContain("script-src 'self' 'sha256-");
    expect(violations).toEqual([]);
  });
}
