// Pure helpers for scripts/check-budgets.mjs: which assets a page loads up
// front, and whether their gzipped sizes fit budgets.json.

const KB = 1024;

const unique = (values) => [...new Set(values)];

const tagsOf = (html, tagName) => html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? null;
const isLocal = (url) => url !== null && url.startsWith("/") && !url.startsWith("//");

const SCRIPT_PRELOAD = /\brel="modulepreload"|\brel="preload"(?=[^>]*\bas="script")/i;

/**
 * Local scripts and stylesheets a modern browser fetches while loading the page:
 * `<script src>` (minus `noModule` polyfills it skips) plus script preloads.
 */
export function extractAssets(html) {
  const scriptTags = tagsOf(html, "script").filter((tag) => !/\bnomodule\b/i.test(tag));
  const linkTags = tagsOf(html, "link");
  const scripts = [
    ...scriptTags.map((tag) => attr(tag, "src")),
    ...linkTags.filter((tag) => SCRIPT_PRELOAD.test(tag)).map((tag) => attr(tag, "href")),
  ];
  const styles = linkTags.filter((tag) => /\brel="stylesheet"/i.test(tag)).map((tag) => attr(tag, "href"));
  return {
    scripts: unique(scripts.filter(isLocal)),
    styles: unique(styles.filter(isLocal)),
  };
}

/** "services.html" → "/services"; null for Next's internal not-found pages. */
export function routeFromHtmlFile(relative) {
  if (relative.startsWith("_not-found")) return null;
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative.slice(0, -".html".length)}`;
}

function routeMatches(pattern, route) {
  return pattern.endsWith("*") ? route.startsWith(pattern.slice(0, -1)) : pattern === route;
}

export function budgetFor(budgets, route) {
  const overrides = Object.entries(budgets.routes ?? {})
    .filter(([pattern]) => routeMatches(pattern, route))
    .map(([, override]) => override);
  return Object.assign({}, budgets.default, ...overrides);
}

const toKb = (bytes) => Math.round((bytes / KB) * 10) / 10;

/** @returns {{route: string, metric: string, actualKb: number, limitKb: number}[]} */
export function evaluateBudgets(measurements, budgets) {
  if (measurements.length === 0) throw new Error("No pages found to measure. Run `npm run build` first.");
  return measurements.flatMap(({ route, jsBytes, cssBytes }) => {
    const limits = budgetFor(budgets, route);
    const checks = [
      { metric: "initialJsKb", actualKb: toKb(jsBytes), limitKb: limits.initialJsKb },
      { metric: "cssKb", actualKb: toKb(cssBytes), limitKb: limits.cssKb },
    ];
    const missing = checks.find((check) => typeof check.limitKb !== "number");
    if (missing) throw new Error(`No ${missing.metric} budget for ${route} in budgets.json`);
    return checks.filter((check) => check.actualKb > check.limitKb).map((check) => ({ route, ...check }));
  });
}
