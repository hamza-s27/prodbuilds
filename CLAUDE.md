@AGENTS.md

# ProdBuilds redesign

Animated rebuild of https://prodbuilds.com (backend, cloud & AI engineering studio). Dark-only brand: tokens live in `src/app/globals.css` (`--brand-*`, mapped onto shadcn variables).

## Stack
- Next.js 16 App Router, `output: "export"` (static `out/`, hosted on Cloudflare), React Compiler on.
- Tailwind v4 + shadcn (radix base, `nova` preset). `cn()` comes from shadcn's `cn` package.
- Motion: prefer CSS scroll-driven animations, IntersectionObserver and small rAF utilities; `ogl` (lazy, after idle) for WebGL. `motion`, `gsap` + `@gsap/react` and `lenis` are installed but the 150 kb budget leaves ~20 kb above the framework, so use them only where `npm run budget` proves they fit (plan §13). Never `three`.
- Every animation must respect `prefers-reduced-motion`.

## Component registries (built into the shadcn CLI)
`npx shadcn@latest add @magicui/<name>` · `@react-bits/<Name>-TS-TW` · `@animate-ui/<name>` · `@aceternity/<name>`
Search with `npx shadcn@latest search @magicui -q <term>`.

## Commands
- `npm run dev` · `npm run build` (static export to `out/`) · `npm run lint` · `npm run typecheck`
- `npm test` / `npm run test:coverage`: Vitest units (80% threshold on lib/content/hooks/scripts/lib)
- `npm run test:e2e`: Playwright on the dev server (320/768/1024/1440 + axe; firefox/webkit run `@smoke` tests)
- `npm run test:e2e:prod`: same tests against `out/` via `scripts/serve-static.mjs` (mimics Cloudflare Pages: clean URLs, 308s, 404.html, `_headers`)
- `npm run budget`: per-route gzipped JS/CSS from `out/` vs `budgets.json` (baseline 130 kb; landing limit 150 kb incl. lazy)

## Guardrails
- Legacy site fixtures: `tests/fixtures/legacy/` (crawled HTML, `inventory.json` of titles/meta/JSON-LD/ids per URL, `url-behaviour.json`, feed/sitemap/robots/forms.js). Every legacy URL, anchor id and head tag must survive the rebuild.
- Plan: `docs/redesign-plan.md` (decisions in §13). Licences: `docs/third-party.md`.
