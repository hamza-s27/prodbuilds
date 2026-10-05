// Mirrors Cloudflare Pages' clean-URL rules, as recorded from the live site in
// tests/fixtures/legacy/url-behaviour.json.

const REDIRECT_STATUS = 308;
const NOT_FOUND = Object.freeze({ type: "not-found" });
// Cloudflare Pages reads these at deploy time and never serves them.
const CONFIG_FILES = new Set(["_headers", "_redirects"]);

const file = (name) => ({ type: "file", file: name });
const redirect = (location) => ({ type: "redirect", status: REDIRECT_STATUS, location });

/** Decodes the path and strips the leading slash; null when unsafe or malformed. */
function toRelative(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const segments = decoded.split("/");
  if (segments.some((segment) => segment === ".." || segment === ".")) return null;
  return decoded.replace(/^\/+/, "");
}

function resolveSlashUrl(relative, exists) {
  if (relative === "") return exists("index.html") ? file("index.html") : NOT_FOUND;
  const base = relative.slice(0, -1);
  if (exists(`${relative}index.html`)) return file(`${relative}index.html`);
  if (exists(`${base}.html`)) return redirect(`/${base}`);
  return NOT_FOUND;
}

function resolveHtmlUrl(relative, exists) {
  if (!exists(relative)) return NOT_FOUND;
  if (relative === "index.html") return redirect("/");
  if (relative.endsWith("/index.html")) return redirect(`/${relative.slice(0, -"index.html".length)}`);
  return redirect(`/${relative.slice(0, -".html".length)}`);
}

/**
 * @param {string} pathname URL pathname, e.g. "/services"
 * @param {(relativeFile: string) => boolean} exists whether a file exists in the output dir
 */
export function resolveRequest(pathname, exists) {
  const relative = toRelative(pathname);
  if (relative === null || CONFIG_FILES.has(relative)) return NOT_FOUND;
  if (relative === "" || relative.endsWith("/")) return resolveSlashUrl(relative, exists);
  if (relative.endsWith(".html")) return resolveHtmlUrl(relative, exists);
  if ((relative === "index" || relative.endsWith("/index")) && exists(`${relative}.html`)) {
    return redirect(`/${relative.slice(0, -"index".length)}`);
  }
  if (exists(relative)) return file(relative);
  if (exists(`${relative}.html`)) return file(`${relative}.html`);
  if (exists(`${relative}/index.html`)) return redirect(`/${relative}/`);
  return NOT_FOUND;
}
