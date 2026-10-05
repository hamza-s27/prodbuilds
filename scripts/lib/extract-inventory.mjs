// Extracts the SEO- and structure-relevant facts from a legacy page, so the
// rebuild can be checked against them (tests/fixtures/legacy/inventory.json).
import * as cheerio from "cheerio";

const normalise = (text) => text.replace(/\s+/g, " ").trim();

/** Groups meta tags by property; a property that repeats keeps all values in an array. */
function metaGroup($, attribute, prefix) {
  return $(`meta[${attribute}^="${prefix}"]`)
    .toArray()
    .reduce((group, el) => {
      const key = $(el).attr(attribute);
      const value = $(el).attr("content") ?? "";
      if (!(key in group)) return { ...group, [key]: value };
      return { ...group, [key]: [group[key], value].flat() };
    }, {});
}

function parseJsonLd(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Malformed JSON-LD (${error.message}): ${text.slice(0, 80)}`);
  }
}

function graphNodes(doc) {
  const roots = Array.isArray(doc) ? doc : [doc];
  return roots.flatMap((root) => (Array.isArray(root?.["@graph"]) ? root["@graph"] : [root]));
}

function collectJsonLd($) {
  const docs = $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => parseJsonLd($(el).text()));
  const nodes = docs.flatMap(graphNodes);
  const types = nodes.flatMap((node) => [node?.["@type"]].flat()).filter(Boolean);
  const ids = nodes.map((node) => node?.["@id"]).filter(Boolean);
  return {
    jsonLd: docs,
    jsonLdTypes: [...new Set(types)].sort(),
    jsonLdIds: [...new Set(ids)].sort(),
  };
}

function collectHeadings($) {
  return $("h1, h2, h3, h4")
    .toArray()
    .map((el) => ({
      level: Number(el.tagName.slice(1)),
      id: $(el).attr("id") ?? null,
      text: normalise($(el).text()),
    }));
}

const attrOrNull = ($, selector, attribute) => $(selector).first().attr(attribute) ?? null;

export function extractInventory(html) {
  const $ = cheerio.load(html);
  const title = normalise($("head > title").first().text());
  const headings = collectHeadings($);
  const ids = $("[id]")
    .toArray()
    .map((el) => $(el).attr("id"));

  return {
    lang: attrOrNull($, "html", "lang"),
    title: title || null,
    description: attrOrNull($, 'meta[name="description"]', "content"),
    keywords: attrOrNull($, 'meta[name="keywords"]', "content"),
    author: attrOrNull($, 'meta[name="author"]', "content"),
    robots: attrOrNull($, 'meta[name="robots"]', "content"),
    themeColor: attrOrNull($, 'meta[name="theme-color"]', "content"),
    canonical: attrOrNull($, 'link[rel="canonical"]', "href"),
    rssHref: attrOrNull($, 'link[rel="alternate"][type="application/rss+xml"]', "href"),
    og: metaGroup($, "property", "og:"),
    twitter: metaGroup($, "name", "twitter:"),
    article: metaGroup($, "property", "article:"),
    ...collectJsonLd($),
    h1: headings.find((heading) => heading.level === 1)?.text ?? null,
    headings,
    ids: [...new Set(ids)].sort(),
  };
}

/** "blog_some-post.html" → "/blog/some-post", "home.html" → "/". */
export function pathFromFixtureName(fileName) {
  const base = fileName.replace(/\.html$/, "");
  return base === "home" ? "/" : `/${base.replaceAll("_", "/")}`;
}
