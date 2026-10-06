import { defineConfig, devices } from "@playwright/test";

// PW_TARGET=prod tests the static export through a Cloudflare-like server
// (clean URLs, 308s, 404.html, out/_headers). Default: the dev server.
const IS_PROD = process.env.PW_TARGET === "prod";
const PORT = IS_PROD ? 4173 : 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Breakpoints from the web testing rules: 320, 768, 1024, 1440.
const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 720 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const chromiumProjects = VIEWPORTS.map(({ name, width, height }) => ({
  name,
  use: { ...devices["Desktop Chrome"], viewport: { width, height } },
}));

// Firefox and WebKit run only tests tagged @smoke. One retry: under parallel
// load Playwright's Firefox occasionally never gets the first response for a
// navigation from the local test server (measured 2026-10-07: 7 of 200 runs at
// 8 workers stalled before DOMContentLoaded, 0 of 60 run one at a time). It's
// the local harness, not the site, which is served by Cloudflare.
const crossBrowserProjects = [
  { name: "firefox", use: { ...devices["Desktop Firefox"] }, grep: /@smoke/, retries: 1 },
  { name: "webkit", use: { ...devices["Desktop Safari"] }, grep: /@smoke/, retries: 1 },
];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [...chromiumProjects, ...crossBrowserProjects],
  webServer: {
    command: IS_PROD ? "npm run build && node scripts/serve-static.mjs" : "npm run dev",
    url: BASE_URL,
    env: { PORT: String(PORT) },
    // A leftover prod server would serve a stale build, so prod always starts fresh.
    reuseExistingServer: !process.env.CI && !IS_PROD,
    timeout: 180_000,
  },
});
