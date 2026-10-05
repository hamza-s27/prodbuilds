// Measures the gzipped JS and CSS each exported page loads up front and fails
// when a route exceeds budgets.json. Lazy chunks (ogl, gsap) are checked by
// Playwright network assertions instead, since they load after idle.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { evaluateBudgets, extractAssets, routeFromHtmlFile } from "./lib/budget.mjs";

const OUT = resolve("out");
if (!existsSync(OUT)) {
  console.error("[budget] out/ does not exist. Run `npm run build` first.");
  process.exit(1);
}
const budgets = JSON.parse(readFileSync(resolve("budgets.json"), "utf8"));

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

const sizeCache = new Map();
function gzippedSize(assetUrl) {
  if (!sizeCache.has(assetUrl)) {
    const path = join(OUT, decodeURIComponent(assetUrl.split("?")[0]));
    sizeCache.set(assetUrl, gzipSync(readFileSync(path)).length);
  }
  return sizeCache.get(assetUrl);
}

const sum = (urls) => urls.reduce((total, url) => total + gzippedSize(url), 0);

function measure(file) {
  const route = routeFromHtmlFile(relative(OUT, file));
  if (route === null) return null;
  const { scripts, styles } = extractAssets(readFileSync(file, "utf8"));
  return { route, jsBytes: sum(scripts), cssBytes: sum(styles), scriptCount: scripts.length };
}

const measurements = htmlFiles(OUT)
  .map(measure)
  .filter(Boolean)
  .sort((a, b) => a.route.localeCompare(b.route));

console.table(
  measurements.map(({ route, jsBytes, cssBytes, scriptCount }) => ({
    route,
    "initial JS (kb gz)": (jsBytes / 1024).toFixed(1),
    "CSS (kb gz)": (cssBytes / 1024).toFixed(1),
    scripts: scriptCount,
  })),
);

let violations;
try {
  violations = evaluateBudgets(measurements, budgets);
} catch (error) {
  console.error(`[budget] ${error.message}`);
  process.exit(1);
}
if (violations.length > 0) {
  for (const v of violations) {
    console.error(`✗ ${v.route}: ${v.metric} ${v.actualKb} kb > ${v.limitKb} kb`);
  }
  process.exit(1);
}
console.log(`✓ ${measurements.length} routes within budget`);
