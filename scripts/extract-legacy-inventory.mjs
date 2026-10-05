// One-off: builds tests/fixtures/legacy/inventory.json from the crawled pages.
// Re-run only if the legacy fixtures change; the output is committed.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { extractInventory, pathFromFixtureName } from "./lib/extract-inventory.mjs";

const FIXTURES = resolve("tests/fixtures/legacy");
const HTML_DIR = join(FIXTURES, "html");

const pages = readdirSync(HTML_DIR)
  .filter((name) => name.endsWith(".html"))
  .map((name) => {
    try {
      return {
        path: pathFromFixtureName(name),
        ...extractInventory(readFileSync(join(HTML_DIR, name), "utf8")),
      };
    } catch (error) {
      throw new Error(`${name}: ${error.message}`);
    }
  })
  .sort((a, b) => a.path.localeCompare(b.path));

const inventory = { source: "https://prodbuilds.com, crawled 2026-10-05", pages };
writeFileSync(join(FIXTURES, "inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`Wrote inventory for ${pages.length} pages`);
