// Parses and applies a Cloudflare Pages `_headers` file:
// https://developers.cloudflare.com/pages/configuration/headers/

/**
 * @typedef {{ pattern: string, set: [string, string][], detach: string[] }} HeaderRule
 */

// https://developers.cloudflare.com/pages/platform/limits/#headers
const MAX_RULES = 100;
const MAX_LINE_LENGTH = 2000;

/** @returns {HeaderRule[]} */
export function parseHeadersFile(source) {
  const rules = [];
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (line.length > MAX_LINE_LENGTH) {
      throw new Error(`_headers line exceeds ${MAX_LINE_LENGTH} characters: "${line.slice(0, 60)}…"`);
    }
    if (line.trim() === "" || line.trim().startsWith("#")) continue;

    if (!/^\s/.test(line)) {
      rules.push({ pattern: line.trim(), set: [], detach: [] });
      continue;
    }

    const current = rules.at(-1);
    if (!current) throw new Error(`Header line before a URL pattern: "${line.trim()}"`);
    const entry = line.trim();
    if (entry.startsWith("!")) {
      current.detach.push(entry.slice(1).trim());
      continue;
    }
    const colon = entry.indexOf(":");
    if (colon < 1) throw new Error(`Malformed header line: "${entry}"`);
    current.set.push([entry.slice(0, colon).trim(), entry.slice(colon + 1).trim()]);
  }
  if (rules.length > MAX_RULES) {
    throw new Error(`_headers has ${rules.length} rules; Cloudflare allows ${MAX_RULES} rules`);
  }
  return rules;
}

function escapeRegExp(text) {
  return text.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

function patternToRegExp(pattern) {
  const source = pattern
    .split(/(\*|:[A-Za-z]\w*)/)
    .map((part) => {
      if (part === "*") return ".*";
      if (part.startsWith(":")) return "[^/]+";
      return escapeRegExp(part);
    })
    .join("");
  return new RegExp(`^${source}$`);
}

/**
 * Merges every matching rule, in file order, into a lower-cased header map.
 * A header set more than once is joined with ", " (Cloudflare's behaviour).
 */
export function headersFor(rules, pathname) {
  return rules
    .filter((rule) => patternToRegExp(rule.pattern).test(pathname))
    .reduce((headers, rule) => {
      const withSet = rule.set.reduce((acc, [name, value]) => {
        const key = name.toLowerCase();
        return { ...acc, [key]: acc[key] ? `${acc[key]}, ${value}` : value };
      }, headers);
      const detached = new Set(rule.detach.map((name) => name.toLowerCase()));
      return Object.fromEntries(Object.entries(withSet).filter(([name]) => !detached.has(name)));
    }, {});
}
