import { expect, test } from "@playwright/test";
import { desktopOnly } from "./helpers";

const APPS_SCRIPT = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/;

desktopOnly();

test.describe("lead form", () => {
  test("submits in place and thanks the visitor @smoke", async ({ page }) => {
    const posted: string[] = [];
    await page.route(APPS_SCRIPT, async (route) => {
      posted.push(route.request().postData() ?? "");
      await route.fulfill({ status: 200, body: "ok" });
    });
    await page.goto("/contact");

    await page.getByLabel("Email address").fill("you@company.com");
    await page.getByRole("button", { name: "Let’s talk" }).click();

    await expect(page.getByRole("status")).toContainText("Thanks — we’ll be in touch by email");
    await expect(page.getByRole("status")).toBeFocused();
    expect(posted).toEqual(["email=you%40company.com"]);
  });

  test("offers email when the request fails", async ({ page }) => {
    await page.route(APPS_SCRIPT, (route) => route.abort("internetdisconnected"));
    await page.goto("/");

    const hero = page.locator("#hero-heading").locator("xpath=ancestor::section");
    await hero.getByLabel("Email address").fill("you@company.com");
    await hero.getByRole("button", { name: "Let’s talk" }).click();

    await expect(hero.getByRole("status")).toContainText("That didn’t go through");
    await expect(hero.getByRole("link", { name: "hello@prodbuilds.com" })).toHaveAttribute(
      "href",
      "mailto:hello@prodbuilds.com",
    );
    await expect(hero.getByLabel("Email address")).toBeFocused();
  });

  test("blocks an invalid address with native validation", async ({ page }) => {
    let requests = 0;
    await page.route(APPS_SCRIPT, (route) => {
      requests += 1;
      return route.fulfill({ status: 200 });
    });
    await page.goto("/contact");

    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByRole("button", { name: "Let’s talk" }).click();

    expect(await page.getByLabel("Email address").evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(
      false,
    );
    expect(requests).toBe(0);
  });
});

test.describe("lead form without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("still posts the email to Apps Script", async ({ page }) => {
    let body = "";
    await page.route(APPS_SCRIPT, async (route) => {
      body = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "text/html", body: "<p>Received</p>" });
    });
    await page.goto("/contact");

    await page.getByLabel("Email address").fill("you@company.com");
    await page.getByRole("button", { name: "Let’s talk" }).click();

    await expect(page.getByText("Received")).toBeVisible();
    expect(body).toBe("email=you%40company.com");
  });
});
