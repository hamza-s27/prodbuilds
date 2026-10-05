// Runs after `next build`: writes out/_headers with a hash-based CSP per route
// and validates it against Cloudflare's limits (parseHeadersFile throws).
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { routeFromHtmlFile } from "./lib/budget.mjs";
import { parseHeadersFile } from "./lib/parse-headers.mjs";
import { buildHeadersFile, inlineScriptHashes } from "./lib/security-headers.mjs";

const OUT = resolve("out");
if (!existsSync(OUT)) {
  console.error("[headers] out/ does not exist. Run `next build` first.");
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

const pages = htmlFiles(OUT)
  .map((file) => ({ route: routeFromHtmlFile(relative(OUT, file)), file }))
  // /404 is served at unknown URLs, which no exact rule can match; it gets the /* baseline CSP.
  .filter(({ route }) => route !== null && route !== "/404")
  .map(({ route, file }) => ({ route, hashes: inlineScriptHashes(readFileSync(file, "utf8")) }))
  .sort((a, b) => a.route.localeCompare(b.route));

const { url: leadEndpoint } = JSON.parse(readFileSync(resolve("src/content/lead-endpoint.json"), "utf8"));
const file = buildHeadersFile(pages, leadEndpoint);
try {
  parseHeadersFile(file);
} catch (error) {
  console.error(`[headers] ${error.message}`);
  process.exit(1);
}
writeFileSync(join(OUT, "_headers"), file);
console.log(`[headers] wrote out/_headers with CSP for ${pages.length} routes`);
