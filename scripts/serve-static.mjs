// Serves the static export (`out/`) the way Cloudflare Pages does: clean URLs,
// 308 redirects (query preserved), 404.html, Cloudflare's default
// Cache-Control, and rules from `out/_headers`. Test use only.
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { pipeline } from "node:stream";
import { headersFor, parseHeadersFile } from "./lib/parse-headers.mjs";
import { resolveRequest } from "./lib/resolve-request.mjs";

const ROOT = resolve(process.argv[2] ?? "out");
const PORT = Number(process.env.PORT ?? 4173);
const DEFAULT_CACHE_CONTROL = "public, max-age=0, must-revalidate";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

if (!existsSync(ROOT)) {
  console.error(`[serve-static] ${ROOT} does not exist. Run \`npm run build\` first.`);
  process.exit(1);
}

const headersPath = join(ROOT, "_headers");
const rules = existsSync(headersPath) ? parseHeadersFile(readFileSync(headersPath, "utf8")) : [];

function isInsideRoot(full) {
  const rel = relative(ROOT, full);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

function exists(relativeFile) {
  const full = join(ROOT, relativeFile);
  if (!isInsideRoot(full)) return false;
  try {
    return statSync(full).isFile();
  } catch {
    return false;
  }
}

/**
 * This server is plain http. Chromium and Firefox exempt localhost from
 * `upgrade-insecure-requests`; WebKit doesn't, and would fetch every asset
 * over https and fail. Production is https-only, where the directive is a no-op.
 */
const withoutUpgrade = (headers) =>
  Object.fromEntries(
    Object.entries(headers).map(([name, value]) =>
      name.toLowerCase() === "content-security-policy"
        ? [name, value.replace(/\s*upgrade-insecure-requests;?/g, "")]
        : [name, value],
    ),
  );

function responseHeaders(relativeFile, pathname) {
  return {
    "content-type": CONTENT_TYPES[extname(relativeFile)] ?? "application/octet-stream",
    "cache-control": DEFAULT_CACHE_CONTROL,
    ...withoutUpgrade(headersFor(rules, pathname)),
  };
}

function sendFile(res, status, relativeFile, pathname) {
  res.writeHead(status, responseHeaders(relativeFile, pathname));
  pipeline(createReadStream(join(ROOT, relativeFile)), res, (error) => {
    if (error) console.error(`[serve-static] failed streaming ${relativeFile}: ${error.message}`);
  });
}

function handle(req, res) {
  // Split manually: `new URL("//x", base)` treats the path as a host.
  const [rawPath, rawQuery] = (req.url ?? "/").split("?", 2);
  const pathname = `/${rawPath.replace(/^\/+/, "")}`;
  const search = rawQuery === undefined ? "" : `?${rawQuery}`;
  const result = resolveRequest(pathname, exists);

  if (result.type === "redirect") {
    res.writeHead(result.status, { location: encodeURI(result.location) + search });
    res.end();
  } else if (result.type === "file") {
    sendFile(res, 200, result.file, pathname);
  } else if (exists("404.html")) {
    sendFile(res, 404, "404.html", pathname);
  } else {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer((req, res) => {
  try {
    handle(req, res);
  } catch (error) {
    console.error(`[serve-static] ${req.url}: ${error instanceof Error ? error.message : error}`);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal server error");
  }
});

server.listen(PORT, () => {
  console.log(`[serve-static] ${ROOT} on http://localhost:${PORT}`);
});
