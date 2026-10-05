// Legacy fixtures with the deliberate changes in intentional-changes.json applied.
import inventory from "./legacy/inventory.json";
import changes from "./intentional-changes.json";

type PageUpdates = Record<string, { date: string; reason: string }>;
const pageUpdated: PageUpdates = changes.pageUpdated;

/** Legacy JSON-LD for a path, with WebPage.dateModified updated where the page changed on purpose. */
export function expectedJsonLd(path: string): unknown[] {
  const page = inventory.pages.find((p) => p.path === path);
  if (!page) throw new Error(`No legacy page ${path}`);
  const update = pageUpdated[path];
  if (!update) return page.jsonLd;
  return page.jsonLd.map((doc) => ({
    ...doc,
    "@graph": (doc["@graph"] as Record<string, unknown>[]).map((node) =>
      node["@type"] === "WebPage" && "dateModified" in node ? { ...node, dateModified: update.date } : node,
    ),
  }));
}

/** Legacy sitemap XML with lastmod updated for pages that changed on purpose. */
export function expectedSitemap(legacyXml: string): string {
  return Object.entries(pageUpdated).reduce(
    (xml, [path, { date }]) =>
      xml.replace(
        new RegExp(`(<loc>https://prodbuilds\\.com${path}</loc>\\s*<lastmod>)[^<]+`),
        `$1${date}`,
      ),
    legacyXml,
  );
}
