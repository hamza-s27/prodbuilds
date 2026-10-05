@AGENTS.md

# ProdBuilds redesign

Animated rebuild of https://prodbuilds.com (backend, cloud & AI engineering studio). Dark-only brand: tokens live in `src/app/globals.css` (`--brand-*`, mapped onto shadcn variables).

## Stack

- Next.js 16 App Router, `output: "export"` (static `out/`, hosted on Cloudflare), React Compiler on.
- Tailwind v4 + shadcn (radix base, `nova` preset). `cn()` comes from shadcn's `cn` package.
- Motion: prefer CSS scroll-driven animations, IntersectionObserver and small rAF utilities; WebGL via the tiny `src/lib/webgl/fullscreen-pass.ts` (lazy, after idle), no WebGL library. `motion`, `gsap` + `@gsap/react` and `lenis` are installed but the 150 kb budget leaves ~20 kb above the framework, so use them only where `npm run budget` proves they fit (plan §13). Never `three`.
- Every animation must respect `prefers-reduced-motion`.

## Component registries (built into the shadcn CLI)

`npx shadcn@latest add @magicui/<name>` · `@react-bits/<Name>-TS-TW` · `@animate-ui/<name>` · `@aceternity/<name>`
Search with `npx shadcn@latest search @magicui -q <term>`.

## Commands

- `npm run dev` · `npm run build` (static export to `out/` **plus** `out/_headers` with per-route hash CSP; Cloudflare's build command must be `npm run build`, not `next build`) · `npm run lint` · `npm run typecheck` · `npm run format`
- `npm test` / `npm run test:coverage`: Vitest units (80% threshold on lib/content/hooks/scripts/lib)
- `npm run test:e2e`: Playwright on the dev server (320/768/1024/1440 + axe; firefox/webkit run `@smoke` tests)
- `npm run test:e2e:prod`: same tests against `out/` via `scripts/serve-static.mjs` (mimics Cloudflare Pages: clean URLs, 308s, 404.html, `_headers`)
- `npm run budget`: per-route gzipped JS/CSS from `out/` vs `budgets.json` (baseline 130 kb; landing limit 150 kb incl. lazy)

## Conventions (Phase 1)

- Plain `<a>` and `<img>`, not `next/link` / `next/image`: their client code doesn't fit the JS budget on a static site.
- `SiteHeader` is rendered by each page with `currentPath` (server-side `aria-current`), not by the root layout.
- No `cn()` in client components (~10 kb of class tables); fine in server components.
- Content lives in `src/content/*` (typed) and MDX (`src/content/posts`, `src/content/legal`). Post heading ids are explicit `<H2 id>`; never let them change. MDX is excluded from Prettier (it would reformat code samples).
- Lead form endpoint lives in `src/content/lead-endpoint.json`; the CSP pins it from there.

## Code graph (graphify)

A local knowledge graph of the code, docs and tests lives in `graphify-out/` (gitignored): `graph.json`, `graph.html` (open in a browser) and `GRAPH_REPORT.md` (hubs and communities). Use it before touching unfamiliar code:

- `graphify query "<question>"`: find relevant code
- `graphify explain "usePillarEngine()"`: a node and its neighbours
- `graphify affected "createPillarRenderer()" --depth 3`: what a change impacts
- `graphify path "A" "B"`: how two pieces connect

Rebuild after code changes with `graphify update .` (local AST parsing, no API cost).

## Guardrails

- Legacy site fixtures: `tests/fixtures/legacy/` (crawled HTML, `inventory.json` of titles/meta/JSON-LD/ids per URL, `url-behaviour.json`, feed/sitemap/robots/forms.js). Every legacy URL, anchor id and head tag must survive the rebuild.
- Plan: `docs/redesign-plan.md` (decisions in §13). Licences: `docs/third-party.md`.
