# Implementation Plan: ProdBuilds animated front-end redesign

This is a plan only. I made no code edits.

Project root: `/Users/hamzashirazi/Documents/Web Development Projects/Prodbuilds` (paths below are relative to it).

**Files I read**

- `CLAUDE.md`, `AGENTS.md`, `next.config.ts`, `package.json`, `tsconfig.json`, `components.json`
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/lib/utils.ts`
- `playwright.config.ts`, `tests/e2e/home.spec.ts`
- All 10 crawled HTML files and `site.css` in the scratchpad
- Next 16 bundled docs: `static-exports.md`, `mdx.md`, `content-security-policy.md`, the metadata conventions, `trailingSlash.md`, `08-turbopack.md`
- Motion 14 / framer-motion 14 exports, Lenis typings, Radix typings

---

## 0. Things I found that change the brief

These came from reading the code and the crawl. Each one is a real constraint.

1. **There is an RSS feed at `/blog/feed.xml`.** Every post and the blog index link to it with `<link rel="alternate">`. It was missing from the URL list and must be kept.
2. **Old asset URLs are referenced from outside the site.**
   - `/images/og.png` and `/images/blog/<slug>.png` are used as OG images.
   - `/favicon.svg` is the JSON-LD `logo`.
   - `/apple-touch-icon.png` is the touch icon.
   - The existing `src/app/opengraph-image.png` would make Next emit a second `og:image` at a hashed `/opengraph-image.png?…` URL. It should go, replaced by explicit `/images/og.png` metadata.
3. **Post heading ids were written by hand, not generated from the heading text** (`#what-we-tested`, `#lock-at-least-for`, `#why-not-a-sweep`, …). `rehype-slug` would produce different ids and break deep links. Ids must be set explicitly.
4. **Blog figures are inline SVG diagrams with CSS classes** (`.d-run`, `.d-lock`, …, `site.css` lines 782–799), not images. There are 4 of them: clock skew, lock overrun, polling gap, soft close. Code blocks are **not highlighted** today. The languages used are xml, sql, java, typescript and text.
5. **The reading progress bar already needs no JavaScript** (`animation-timeline: scroll(root)`). Keep that approach.
6. **No hidden fields on any of the 3 forms.** Only `name="email"`. Forms carry `data-status` / `data-note` ids, and there is a `role="status"` paragraph next to each.
   - `forms.js` was not crawled. Its exact status messages need fetching (Phase 0).
7. **Cloudflare Email Obfuscation is on.** It rewrites the HTML (`/cdn-cgi/l/email-protection`, `email-decode.min.js`).
   - Rewritten HTML will cause React hydration mismatches.
   - It protects nothing: `hello@prodbuilds.com` is already in plain text in the JSON-LD.
   - Recommendation: turn it off and render plain `mailto:` links.
8. **A per-request nonce CSP is impossible with a static export** (confirmed in the Next docs). Next's static HTML contains inline `self.__next_f.push` scripts. The option that works is per-page **sha256 hashes generated after the build** into `out/_headers`.
9. **The FAQ answers must stay in the HTML.**
   - The FAQ has `FAQPage` JSON-LD, so the answers should be visible in the HTML too.
   - Radix Accordion removes closed answers from the HTML.
   - Radix in `node_modules` has no `hiddenUntilFound`, so closed answers can't be kept findable.
   - Recommendation: native `<details name="faq">` (see the decision table).
10. **WCAG 2.2.2 (Pause, Stop, Hide, Level A).** A light pillar that animates forever and an endless marquee each need a visible pause control. Reduced-motion support alone does not satisfy it.
11. **Motion 14** exports `LazyMotion` / `domAnimation` from `motion/react` and `m` from `motion/react-m`. Registry components import `motion.div`, which throws under `LazyMotion strict`. Every copied registry component has to be switched to `m.*`.
12. **Turbopack is the default for `next build` in Next 16.** MDX remark/rehype plugins must be given as strings with JSON-serialisable options. Fallback is `next build --webpack`.

---

## 1. Requirements

**Pages and URLs**

- Rebuild prodbuilds.com as an animated, static-export Next 16 site on Cloudflare, keeping every URL:
  - `/`, `/services` (anchors `#backend #scaling #cloud #product #automation #ai`), `/how-we-work`, `/contact`, `/privacy`, `/terms`, `/blog`
  - 3 posts at `/blog/<slug>`, each with its heading anchors
  - `/blog/feed.xml`, `/sitemap.xml`, `/robots.txt`
  - Legacy asset URLs
- Keep the copy close to word-for-word. It should still read as one engineer talking to another. All content lives in typed data or MDX modules, not in JSX.

**Lead form**

- One shared progressive-enhancement component, used in 3 places (home hero, home final CTA, contact).
- Without JS it does a plain POST to Apps Script. With JS it uses fetch `no-cors` + URLSearchParams, a 20 s abort, an `aria` status region, and falls back to `mailto:hello@prodbuilds.com`.

**Signature effects**

- Home hero: an ogl LightPillar with particles, 4 principle chips joined by hairlines, and a static poster fallback.
- Services: "dive through the stack" with a depth gauge, DecryptedText HUD labels and Animated Beams, using GSAP ScrollTrigger + Lenis.
- Also: process pipeline, data-fact counters, stack marquee, findings terminal, FAQ, and a Border Beam on forms.
- Particle coalescence at the final CTA is a stretch goal.
- Blog: a strong reading experience with highlighting done at build time and very little motion.

**Constraints**

- Home: 150 kb gz JS and 30 kb CSS at most. LCP under 2.5 s, INP under 200 ms, CLS under 0.1.
- Heavy libraries load lazily and only on the pages that use them.
- Full reduced-motion support, AA contrast, keyboard access, semantic HTML.
- No tracking. A CSP via `_headers`.
- Files under 400 lines, functions under 50 lines, immutable data.
- Workflow: ECC (plan, TDD, code review, verify). Vitest units plus Playwright for visual, axe, reduced motion, the form and Lighthouse.

---

## 2. Design direction and system

**Direction: "Production telemetry".** The visual language of ops tooling, done with editorial restraint:

- mono HUD labels, hairline rules, faint blueprint grid with static grain;
- teal signal paths that show where data flows;
- status colours used for meaning.

It deliberately avoids gradient blobs, uniform card grids and default shadcn looks. It is original work inspired by Beacon, Abyssal and Halide; no Scrolltide code or prompts.

**Palette (extends the existing `--brand-*` tokens in `src/app/globals.css`)**

- Keep: bg `#0C0C0F`, surface `#141419`, teal `#1CB495`, text `#ECEBE6`, body `#C8C7C2`, muted `#8B8B94`, border `#24242D`, field `#62626C`, bad `#FF6B5B`.
- Add:
  - `--brand-surface-2: #1B1B22` (raised layer)
  - `--brand-hairline: rgb(236 235 230 / 0.08)`
  - `--brand-teal-dim: #138A72`
  - `--brand-teal-glow: rgb(28 180 149 / 0.35)`
  - `--brand-scrim` (gradient that sits behind text over WebGL)
- What colour means:
  - Teal means healthy, active path, or primary action.
  - Coral `#FF6B5B` means failure or duplicate (blog verdicts, form errors) and nothing else.
  - Muted means idle or secondary.
  - There is no other accent colour.
- Contrast, computed:
  - teal on bg: about 7.4:1
  - muted on bg: about 5.8:1
  - field border on bg: about 3.2:1 (passes 1.4.11 for UI components)

**Typography (needs your decision, see Open questions).** The rules allow at most 2 families, so a new display face has to _replace_ Roboto, not join it.

| Option              | Pairing                                                | Character                                                                                                                                                                          | Font cost                                             |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **A (recommended)** | **Archivo variable (`wght` + `wdth`)** + IBM Plex Mono | Expanded width (about 115–125) at 700–800 for display gives an industrial, infrastructure feel. Normal width at 400 for body. One family gives strong contrast in scale and width. | About 1 variable file (latin subset) + 2 mono weights |
| B                   | IBM Plex Sans variable + IBM Plex Mono                 | Same superfamily, very coherent, engineering heritage, less distinctive                                                                                                            | Similar                                               |
| C                   | Keep Roboto + Plex Mono                                | No brand risk, but generic (the design rules ban default-looking type)                                                                                                             | Current                                               |

Type scale:

| Role          | Size                                      | Line-height / spacing                |
| ------------- | ----------------------------------------- | ------------------------------------ |
| `--text-hero` | `clamp(2.75rem, 1.1rem + 6.2vw, 6.75rem)` | tracking -0.035em, line-height 0.95  |
| `--text-h2`   | `clamp(2rem, 1.2rem + 3vw, 3.75rem)`      | —                                    |
| `--text-h3`   | `clamp(1.25rem, 1rem + 0.8vw, 1.625rem)`  | —                                    |
| `--text-base` | `clamp(1rem, 0.94rem + 0.3vw, 1.125rem)`  | line-height 1.65; prose measure 68ch |
| `--text-hud`  | 0.75rem mono, uppercase                   | tracking 0.14em                      |

**Spacing rhythm.** Spacing is deliberately uneven:

- `--space-section-major: clamp(6rem, 3rem + 8vw, 12rem)` after the hero and before the final CTA.
- `--space-section: clamp(4rem, 2.5rem + 5vw, 8rem)` elsewhere.
- Spacing inside a cluster stays tight, on an 8 px base.
- Layout is a 12-column grid. Content is offset (starts at column 2 or 3) for editorial asymmetry. Hero visuals break the grid and overlap into the next section.

**Depth.** Three planes:

1. Background: grid, grain, WebGL.
2. Middle: surfaces with a 1 px hairline border and a 1 px top inner highlight.
3. Front: HUD labels and chips.

Shadows are neutral for elevation. Teal glow is reserved for the active or focused element. Radii vary on purpose: 2 px for HUD, chips and code; 10 px for forms and surfaces; full pill for primary buttons only.

**Interaction states**

- Primary button:
  - hover: brighter, with a beam sweeping across via a transformed pseudo-element;
  - active: `translateY(1px) scale(.98)`;
  - focus-visible: 2 px teal ring, 3 px offset.
- Links: underline drawn by a pseudo-element with `scaleX`.
- Lead form: the Border Beam runs only on `:focus-within` or hover. Motion there signals "this input is live".

**Motion principles**

- Durations: `--duration-fast 150ms`, `normal 300ms`, `slow 600ms`.
- Easing: `--ease-out-expo` (exists) plus a new `--ease-in-out-quart`.
- Motion only (a) shows data flow (beams), (b) shows state (counters, decrypt, pipeline stages) or (c) shows depth (the dive).
- Below-the-fold reveals use CSS `animation-timeline: view()` inside `@supports` and `prefers-reduced-motion: no-preference`. That costs zero JS, and content stays visible without JS or support.
- HUD text must never show fake telemetry. Labels describe; they don't invent metrics.

---

## 3. Information architecture per page

### Route structure

Route groups do not change URLs.

```
src/app/layout.tsx                 root: fonts, <html class="dark">, skip link, header, footer
src/app/(marketing)/layout.tsx     MotionProvider (LazyMotion, async features). Home, services, how-we-work, contact
src/app/(content)/layout.tsx       no animation runtime. Blog, privacy, terms
```

### Home `/` (`src/app/(marketing)/page.tsx`)

| #   | Section                                                                                                                  | Content source             | Powered by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Header                                                                                                                   | `site.ts` nav              | Server component. Sticky. The scroll-shadow border is CSS `animation-timeline: scroll()`.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2   | Hero: eyebrow, h1 "Software that holds up in production.", lead, LeadForm (`hero`), note "No spam. Just a conversation." | `home.ts`, `principles.ts` | Text is server-rendered with **no entrance animation**, so the h1 is the LCP element. `HeroVisual` (client) shows the poster first, then after idle and in view lazy-loads `LightPillarCanvas` (ogl). `PrincipleChips` is a real `<ul aria-label="Principles">` of 4 chips joined to the pillar by SVG hairlines (motion `pathLength`). Each chip links to `/how-we-work#principles`. A pause button sits on the visual. Mobile: the pillar is dimmed behind a scrim and the chips become a 2×2 list under the form. |
| 3   | Services: "Backend, cloud and AI work…"                                                                                  | `services.ts`              | `StackList`: 6 rows styled as layers in a stack (stack order), not a card grid. Mono tag, large title, summary. On hover/focus the row lifts and shows its stack chips. Each row links to `/services#id`. Then `StackMarquee`: the de-duplicated union of all "Typical stack" chips, built from the data. It pauses on hover/focus and with the global toggle; under reduced motion it is a static list.                                                                                                             |
| 4   | Data band: "Your data stays yours."                                                                                      | `privacy-facts.ts`         | `DataFacts`. "0" is static with a mono readout caption. "Never" uses DecryptedText to settle on the word. "30 days" uses a NumberTicker from 0 to 30. **The server renders the final values**, the animation runs only after hydration and in view, and the animated characters are `aria-hidden` next to real text.                                                                                                                                                                                                 |
| 5   | How we work: "From first call to production, in four steps."                                                             | `process.ts`               | `ProcessPipeline`: CI-style stages, horizontal at 1024 px and up, vertical below. A teal pulse runs along the connector (transform) and stages move queued → running → passed in view. It is an `<ol>`.                                                                                                                                                                                                                                                                                                              |
| 6   | Blog: "Engineering notes."                                                                                               | `posts/index.ts`           | `FindingsTerminal` (Magic UI Terminal, adapted, `aria-hidden` because it repeats card facts) types real findings: "21/21 runs happened twice with no lock", the JobRunr log line, "5 simultaneous closes → 1 close". Next to it, 3 `PostCard`s laid out editorially (lead post large, 2 stacked).                                                                                                                                                                                                                    |
| 7   | Final CTA: "Ready to build something?"                                                                                   | `home.ts`                  | LeadForm (`cta`) with Border Beam. Stretch: `ParticleCoalesce` behind it, which reuses the ogl chunk.                                                                                                                                                                                                                                                                                                                                                                                                                |
| 8   | Footer                                                                                                                   | `site.ts`                  | Server component, plus the global "Motion: on/off" toggle.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### Services `/services` (`src/app/(marketing)/services/page.tsx`)

**Layer order** follows a request's real path from the user downwards. AI cuts across all layers.

| Depth | id            | HUD label                            | Why here                                                                                                                        |
| ----- | ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| L0    | `#product`    | `L0 · SURFACE · PRODUCT`             | Where the request starts (UI, MVPs, real-time)                                                                                  |
| L1    | `#backend`    | `L1 · INTERFACE · API`               | Contracts, data models                                                                                                          |
| L2    | `#scaling`    | `L2 · THROUGHPUT · CACHE + QUEUE`    | Requests hit cache, writes go to queues                                                                                         |
| L3    | `#automation` | `L3 · WORKERS · JOBS + INTEGRATIONS` | Queues feed jobs and integrations                                                                                               |
| L4    | `#cloud`      | `L4 · BEDROCK · INFRA`               | Everything runs on this                                                                                                         |
| Rail  | `#ai`         | `XL · AI · CROSS-CUTTING`            | A vertical rail beside the stack. On activation, beams tap into L0 (LLM features) and L1/data (MCP), "with limits you control". |

Page structure:

1. Breadcrumb, h1, lead (server).
2. `StackDive`, **at 1024 px and up**:
   - Left column: a sticky (CSS `position: sticky`) `StackVisual` — 5 slabs, an AI rail, a `DepthGauge` and `HudLabel`s.
   - Right column: 6 normal `<section id=…>` blocks (`ServiceLayerSection`) with "What's included", "Typical stack" and "Related reading".
   - GSAP ScrollTrigger (lazy) runs one trigger per section. As each section crosses the viewport centre, the active slab updates, the beam path draws (scrubbed), the gauge needle moves and the HUD label decrypts.
   - Lenis is started only on this page.
   - **The content is never pinned** (no pin-spacers). That keeps anchors, find-in-page, the no-JS view and CLS safe.
3. **Below 1024 px or with reduced motion:** no sticky visual and no GSAP or Lenis. Each section gets a small server-rendered stack glyph highlighting its layer and a static HUD tag.
4. CTA "Not sure which of these you need?" linking to `/contact`.

### How we work `/how-we-work`

1. Breadcrumb, h1 "From first call to production, with no surprises.", lead.
2. `ProcessTimeline`: a vertical tracing beam (adapted from Aceternity Tracing Beam, motion `useScroll` on the `m` runtime). It holds 4 `<section aria-labelledby="step-N">` blocks. The `#step-1` to `#step-4` ids are kept. Each has a "What you get" readout styled as a pipeline artifact.
3. `PrinciplesGrid` (`id="principles"`, new anchor): 6 principles as a bento with hierarchy. The 4 hero principles are larger; "Works with your team" and "Your data stays yours" are smaller. Hover and focus states are designed; no auto-motion.
4. `FaqList`: native `<details name="faq">` with CSS `::details-content` and `interpolate-size` animation (Animate UI visual treatment, chevron rotation). Rich answers include the privacy, contact and email links.
5. CTA "Ready to talk it through?".

### Contact `/contact`

Breadcrumb, h1, lead. Two columns:

- LeadForm (`contact`) with Border Beam, and the note "We only use your email to reply…".
- "Prefer to write?" with a plain `mailto:`, then "What happens next": a 3-step `<ol>` with a static pipeline treatment.

Motion here is minimal.

### Blog index `/blog`

Breadcrumb, h1, lead, then an editorial `PostList`: mono topic, `<time>`, read time, h2 link, teaser. A light hover state is the only motion.

### Post `/blog/[slug]` (`generateStaticParams`, `dynamicParams = false`)

- `ReadingProgress`: CSS only.
- Breadcrumb (post's short name), h1, lead, meta.
- `<article class="prose">` from MDX:
  - `Stats`, `Tldr`, `Callout`, `Verdict`
  - `TableWrap` (focusable region)
  - code highlighted with Shiki at build time (custom theme in brand colours; zero client JS)
  - a `Figure` with diagram components
  - `AnchorHeading` (the `#` link shows on hover/focus)
- Post footer with sources, then next/prev post.
- Optional diagram draw-in using CSS view timelines.

### Privacy `/privacy` and Terms `/terms`

Legal prose from `src/content/legal/*.mdx`, with "Last updated" `<time>`. No motion.

### 404 (`src/app/not-found.tsx`)

On-brand, mono "404 · route not in production", with links back.

---

## 4. Implementation phases

Every phase follows ECC:

1. Tests first (red).
2. Implement (green).
3. code-reviewer (plus typescript-reviewer, and security-reviewer on form, CSP and headers).
4. Verify: `npm run lint && npm run typecheck && npm run test && npm run build && npm run budget && npm run test:e2e`.

Every phase can be merged on its own.

### Phase 0: Guardrails and baseline (no visual change)

**0.1 Collect live artifacts.** `public/images/og.png`, `public/images/blog/*.png`, `public/favicon.svg`, `public/apple-touch-icon.png`, `tests/fixtures/legacy/`

- Download from the live site: og.png, the 3 blog OG PNGs, favicon.svg, apple-touch-icon.png, `forms.js` (for the exact status copy), `sitemap.xml`, `robots.txt`, `blog/feed.xml`.
- Copy the 10 crawled HTML files into `tests/fixtures/legacy/html/`.
- Record live behaviour for `/services/`, `/services.html` and `/index.html` (curl `-I`) in `tests/fixtures/legacy/url-behaviour.json`.
- Risk: Low.

**0.2 Legacy inventory fixture.** `tests/fixtures/legacy/inventory.json` (implemented as JSON)

- Generated once by `scripts/extract-legacy-inventory.mjs` from the fixtures, then committed. It lists, per URL:
  - title, description, canonical, robots, og:_, twitter:_, article:*
  - JSON-LD `@type`s and `@id`s
  - all element ids
  - h1 text
  - key copy strings
- Depends on 0.1. Risk: Low.

**0.3 Unit test tooling.** `vitest.config.mts`, `vitest.setup.ts`, `package.json`

- Add devDeps: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@vitest/coverage-v8`.
- Scripts: `test`, `test:unit`, `test:coverage`.
- Coverage threshold 80% on `src/lib/**`, `src/content/**`, `src/hooks/**`.
- Risk: Low.

**0.4 Production-like static server.** `scripts/serve-static.mjs`, using only `node:http`

- Clean URLs (`/services` → `services.html`).
- Serves `404.html` with status 404.
- Applies `out/_headers` the way Cloudflare does.
- Playwright: add a `prod` project group (webServer: `npm run build && node scripts/serve-static.mjs`). Keep the `dev` group for fast local runs. Add `firefox` and `webkit` projects for a smoke subset.
- Risk: Medium. Its clean-URL and header behaviour must match Cloudflare. Check against 0.1's recorded behaviour.

**0.5 Budget checker.** `scripts/check-budgets.mjs`, `budgets.json`

- For each route's HTML in `out/`:
  - sum the gzipped size of the `<script src>` files (initial JS);
  - sum CSS;
  - list lazy chunks per route from a manifest written by a tiny `data-chunk` convention, or a Turbopack stats check — confirm which during the work.
- Fail if over budget.
- Build the current placeholder and **record the framework baseline**. This number decides how much room the home page has.
- Risk: Medium.

**0.6 Licence check.** Record in `docs/third-party.md`, or the existing docs location (ask first per AGENTS.md).

- Check React Bits (MIT + Commons Clause — fine for use in a site), Magic UI (MIT), Aceternity (free tier terms), Animate UI (MIT).
- Risk: Low.

**Acceptance**

- `npm run test` and `npm run budget` run green.
- Baseline JS is recorded.
- The prod-server Playwright run passes the existing `home.spec.ts`.

### Phase 1: Content, shell, SEO parity and working forms (static)

This alone is a launchable site.

**1.1 Typed content modules.** `src/content/`

- `site.ts` — nav, footer, contact email, org facts, `APPS_SCRIPT_URL`
- `services.ts` — `Service { id: ServiceId; tag; title; homeSummary; intro; included: readonly string[]; stack: readonly string[]; relatedPostSlugs; layer: { depth; hud } }`
- `process.ts`
- `principles.ts` — `featuredInHero: boolean`
- `faq.ts` — answers as `RichText = readonly (string | { href: string; label: string })[]`
- `privacy-facts.ts`
- `home.ts` — section copy
- `posts/index.ts` — slug, h1 title, seoTitle, description, lead, topic, date, readMinutes, ogImage, keywords, wordCount, breadcrumbName, teaser, finding
- Everything is `as const` / `readonly`. Helpers live in `src/lib/content/` (`rich-text.ts` `toPlainText()`, `stack-union.ts`, `ordered-services.ts`).
- Tests (`*.test.ts`):
  - service ids exactly match the legacy anchors
  - related slugs exist
  - every service has a non-empty stack
  - the 4 hero principles exist
  - FAQ plain text equals the legacy JSON-LD text
  - copy strings match `inventory.ts`
- Risk: Low.

**1.2 SEO library.** `src/lib/seo/`

- `metadata.ts`: `buildPageMetadata({ title, description, path, ogImage?, ogTitle?, type?, article? })` → `Metadata`.
  - Supports the cases where OG title and `<title>` differ (services, posts).
  - Handles robots variants and `alternates.types` for RSS.
- `json-ld.ts`: pure builders `organizationNode`, `websiteNode`, `offerCatalog(services)`, `breadcrumbList(items)`, `faqPage(faq)`, `blog(posts)`, `blogPosting(post)`, `webPage(...)`.
- `src/components/seo/JsonLd.tsx` renders the result with `JSON.stringify(...).replace(/</g, "\\u003c")`. This is the only sanitised `dangerouslySetInnerHTML`, per the Next json-ld guide.
- `theme-color` goes through the `viewport` export.
- Tests: snapshot each builder against the legacy JSON-LD in `inventory.ts`.
- Risk: Low.

**1.3 Tokens and typography.** `src/app/globals.css`, `src/app/layout.tsx`

- Add the tokens from section 2, focus ring utilities, and `scroll-padding-top: var(--header-h)` (WCAG 2.4.11).
- Grain and grid textures as static CSS/SVG data URIs.
- Apply the chosen font via `next/font/google` (check `13-fonts.md` for the `axes: ['wdth']` syntax).
- Remove `src/app/opengraph-image.png`; use explicit `/images/og.png`.
- Keep `src/app/icon.svg` and `apple-icon.png`, and also keep the legacy `public/favicon.svg` and `public/apple-touch-icon.png`.
- Depends on the typography decision. Risk: Medium (brand change).

**1.4 Site shell.** `src/components/layout/`

- `SiteHeader.tsx`, `NavLinks.tsx` (small client island using `usePathname` for `aria-current`), `SiteFooter.tsx`, `SkipLink.tsx`, `Breadcrumbs.tsx` (renders visible crumbs and returns JSON-LD from one data source), `PageHead.tsx`.
- Move `page.tsx` into the `(marketing)` group and create both group layouts.
- Risk: Low.

**1.5 Lead form.** `src/lib/lead/` and `src/components/lead-form/`

- `lead-config.ts`: URL, `LEAD_TIMEOUT_MS = 20_000`, messages from `forms.js`.
- `validate-email.ts`.
- `submit-lead.ts`: `submitLead(email, { fetchImpl, signalFactory }) => Promise<LeadResult>`, a discriminated union `sent | network-error | timeout`.
- `useLeadForm.ts`: state machine `idle → submitting → sent | failed`.
- `LeadForm.tsx` (client), props `{ idPrefix, note, submitLabel }`:
  - Renders a real `<form method="post" action={APPS_SCRIPT_URL}>`, an `sr-only` label, `type=email required autocomplete=email`, and `<p role="status">`.
  - With JS: `preventDefault`, then fetch `no-cors`.
  - On failure: status with a mailto link.
- No zod on the client (saves bundle). Native constraint validation plus `validate-email`.
- Tests:
  - unit: success, abort at 20 s (fake timers), rejected fetch, invalid email
  - e2e `lead-form.spec.ts`:
    - mock `script.google.com` with `page.route` for success and for a network error (mailto fallback shown)
    - timeout via `page.clock`
    - `javaScriptEnabled: false` context: the submit posts to the mocked action URL with `email=`
- Risk: **High** (it is the conversion path). Run the security-reviewer.

**1.6 Static pages.** No signature motion yet. Plain CSS reveals are fine.

- `(marketing)/page.tsx`, `services/page.tsx`, `how-we-work/page.tsx`, `contact/page.tsx`; `(content)/privacy/page.tsx`, `terms/page.tsx`, `blog/page.tsx`.
- Feature components get server-only first versions: `StackList`, `DataFacts` (static values), `ProcessPipeline` (static), `PrinciplesGrid`, `FaqList` (details), `PostCard`, `FinalCta`.
- Depends on 1.1–1.5. Risk: Low.

**1.7 Blog pipeline.** `next.config.ts`, `src/mdx-components.tsx`, `src/content/posts/*.mdx`, `src/components/blog/`

- Deps: `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx remark-gfm @shikijs/rehype shiki` plus a heading-id plugin (`remark-heading-id`, so headings can be written `## Title {#what-we-tested}`).
- Plugins are passed as **strings with JSON options** (Turbopack). Custom theme JSON: `src/lib/mdx/shiki-prodbuilds.json`.
- **Start with a half-day spike.** If any plugin fails under Turbopack, switch `build` to `next build --webpack` and record why.
- Migrate the 3 posts from the HTML fixtures with a one-off `scripts/html-to-mdx.mjs` (rehype-parse → remark → mdx), then review by hand.
- Furniture components: `Stats.tsx`, `Tldr.tsx`, `Callout.tsx`, `Verdict.tsx`, `TableWrap.tsx`, `Figure.tsx`, `AnchorHeading.tsx`, `PostHeader.tsx`, `PostFooter.tsx`, `ReadingProgress.tsx`.
- Diagrams `diagrams/{ClockSkewDiagram,LockOverrunDiagram,PollingGapDiagram,SoftCloseDiagram}.tsx` are inline SVG with the original `<title>`/`<desc>`. The `.d-*` classes are ported to `src/components/blog/prose.css`.
- `(content)/blog/[slug]/page.tsx` with `generateStaticParams`, `dynamicParams = false` and `generateMetadata` (article OG: publishedTime, modifiedTime, section).
- Check AA contrast of the Shiki token colours on `#141419`.
- Risk: **Medium-High** (plugin compatibility, keeping heading ids).

**1.8 Metadata routes.**

- `src/app/sitemap.ts` (`dynamic = 'force-static'`, built from routes plus posts, lastmod from data).
- `src/app/robots.txt`: a static copy of the live file, byte for byte.
- `src/app/(content)/blog/feed.xml/route.ts` (`force-static`), using `src/lib/feed/build-rss.ts` (pure, unit-tested against the live feed's structure).
- `src/app/not-found.tsx`.
- Risk: Low.

**1.9 Headers and CSP.** `scripts/postbuild-headers.mjs` (wired as the npm `postbuild` script), `src/config/security-headers.ts`

- For each `out/**/*.html`, sha256 every inline executable `<script>` (skip `application/ld+json`) and write a per-route rule into `out/_headers`.
- Policy:
  - `default-src 'self'`
  - `script-src 'self' <hashes>`
  - `style-src 'self' 'unsafe-inline'` (style attributes from motion and React)
  - `img-src 'self' data:`
  - `font-src 'self'`
  - `connect-src 'self' https://script.google.com https://script.googleusercontent.com`
  - `form-action 'self' https://script.google.com https://script.googleusercontent.com` (Apps Script redirects)
  - `frame-ancestors 'none'`
  - `base-uri 'self'`
  - `object-src 'none'`
  - `upgrade-insecure-requests`
- Plus HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`.
- Cache headers: `/_next/static/*` immutable for 1 year; HTML `max-age=0, must-revalidate`.
- Watch Cloudflare `_headers` limits (100 rules; per-line length) and fail the script if exceeded.
- Test: `csp.spec.ts` (prod server) fails on any console `Content Security Policy` violation, on every route.
- Risk: **High**.

**Phase 1 acceptance**

- `seo-parity.spec.ts`: every legacy URL returns 200, and title, description, canonical, OG/Twitter, robots, JSON-LD types and ids, and every legacy element id (including post heading ids, `#step-1..4`, service anchors) match `inventory.ts`.
- `/blog/feed.xml`, `/sitemap.xml` and `/robots.txt` are valid.
- `/images/og.png`, `/favicon.svg` and `/apple-touch-icon.png` return 200.
- axe is clean on all routes.
- The form works with and without JS.
- No CSP violations.
- Budget passes.
- Lighthouse performance is 95 or more.

### Phase 2: Motion foundations and home hero

**2.1 Motion infrastructure**

- `src/components/motion/MotionProvider.tsx`: `LazyMotion strict`, with features loaded asynchronously from `src/components/motion/features.ts` (`domAnimation`).
- Hooks in `src/hooks/`:
  - `usePrefersReducedMotion.ts`
  - `useMotionPreference.ts`: OS setting AND the user toggle; stored in `localStorage` (not a cookie); sets `html[data-motion="off"]`
  - `useInViewOnce.ts`
  - `useIdle.ts`: `requestIdleCallback`, with a `setTimeout` fallback for Safari
  - `usePageVisibility.ts`
- `src/components/motion/MotionToggle.tsx` (footer).
- CSS utilities in `src/styles/motion.css`: `.reveal` view-timeline classes, all off under `[data-motion="off"]` and reduced motion.
- Tests: hooks with mocked `matchMedia`, `IntersectionObserver` and `localStorage`.
- Risk: Low.

**2.2 Render quality logic** (pure, TDD). `src/lib/webgl/`

- `capability.ts`: `canUseWebGL()` tries a context with `failIfMajorPerformanceCaveat: true`; also checks `saveData` and reduced motion.
- `quality.ts`: `initialQuality({ dpr, cores, viewport })` → `{ dprCap: ≤1.5 (1 on mobile), renderScale: 0.5–0.75, fpsCap }`.
- `nextQualityStep(frameSamples, current)`: lowers the render scale when average frame time is over 20 ms; falls back to the poster when it stays over 33 ms.
- Risk: Low.

**2.3 LightPillar port to ogl.** `src/components/hero/`

- `shaders/light-pillar.frag.ts` and `light-pillar.vert.ts`:
  - The shader is re-implemented from the React Bits LightPillar idea with brand uniforms (`uColor` teal, `uIntensity`, `uTime`).
  - Particles are drawn as hashed noise inside the same fragment shader: one fullscreen `Triangle`, one draw call.
- `create-pillar-renderer.ts` imports only `Renderer`, `Program`, `Mesh`, `Triangle` from `ogl`. It returns `{ start, stop, resize, destroy }`, handles `webglcontextlost`, and has a ResizeObserver.
- `LightPillarCanvas.tsx` (client):
  - Loaded via dynamic `import()` only after `useIdle` AND in view AND motion allowed AND `canUseWebGL`.
  - Pauses offscreen (IntersectionObserver) and on a hidden tab.
  - Exposes `data-render-state="idle|running|paused|fallback"` for tests.
  - Fades in on opacity only.
- `HeroPoster.tsx`: a static CSS/SVG pillar glow, the same composition at frame 0. No raster image, no CLS.
- `PrincipleChips.tsx` and `ChipConnectors.tsx`: SVG hairlines; motion `pathLength` draws once; chips float with a small `transform` loop that stops with the pause control.
- `HeroVisual.tsx` decides between poster and canvas and hosts the pause button (`aria-pressed`).
- Risk: **Medium-High**: shader port effort, GPU differences, keeping text contrast over the glow (scrim plus placement away from the text column at 1024 px and up).

**Phase 2 acceptance**

- Lighthouse on `/`: LCP element is the h1, LCP under 2.5 s, CLS under 0.1, TBT under 200 ms.
- The ogl chunk does not load before idle (network assertion).
- `hero-webgl.spec.ts`:
  - stubbing `getContext` to return null gives `fallback` with the poster visible;
  - reduced motion means no `<canvas>`;
  - scrolling the hero offscreen gives `paused`;
  - the pause button stops it.
- Budget: home total JS (including idle chunks) is 150 kb or less.

### Phase 3: Home section motion

1. **Registry intake.** Run the shadcn CLI: `@magicui/marquee`, `@magicui/number-ticker`, `@magicui/terminal`, `@magicui/border-beam`, `@react-bits/DecryptedText-TS-TW`.
   - Adapt each in `src/components/ui/`: `motion.*` → `m.*`, reduced-motion and toggle aware, server-render the final text, no `Math.random` during render (scramble only after mount, to avoid hydration mismatch), files under 400 lines.
   - Risk: Medium.
2. **`StackMarquee` and the `StackList` hover states.** `src/components/services/`. Duplicate track `aria-hidden`; pause on hover/focus/toggle.
3. **`DataFacts` with `FactValue`.** `src/components/privacy/`. Ticker and decrypt with final values in the HTML.
4. **`ProcessPipeline` stages.** `src/components/process/`. Pulse on transform; stage state is held in `data-stage-state` attributes.
5. **`FindingsTerminal`.** `src/components/blog/`. Runs once in view and finishes within 5 s (keeps WCAG 2.2.2 out of scope).
6. **`BorderBeamFrame` around `LeadForm`.** Active only on `:focus-within` or hover.

**Acceptance**

- `reduced-motion.spec.ts`: every section's final content is visible and nothing animates (computed `animation-name: none`, no running WAAPI animations).
- axe passes in both motion modes.
- Budget still passes.

### Phase 4: Services "dive"

1. **Pure scroll mapping** (TDD). `src/lib/motion/stack-progress.ts`: `activeLayer(sectionProgress[])`, `beamProgress(layerIndex, localProgress)`, `gaugeAngle(depth)`.
2. **Loader.** `src/components/services/use-stack-dive.ts`:
   - Dynamically import `gsap`, `gsap/ScrollTrigger` and `lenis` inside `useGSAP` (`@gsap/react`, scoped cleanup).
   - Lenis setup: `anchors: true`, `lenis.on('scroll', ScrollTrigger.update)`, driven by the GSAP ticker, `lagSmoothing(0)`.
   - Wrapped in `gsap.matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 1024px)')` plus the user toggle.
   - Lenis is destroyed on route change.
3. **Visual components.** `StackVisual.tsx` (SVG slabs and AI rail), `DepthGauge.tsx`, `HudLabel.tsx` (DecryptedText), and the Animated Beam (`@magicui/animated-beam`, adapted to `m`, ResizeObserver).
4. **`ServiceLayerSection.tsx`** in normal document flow, keeping `id` and `aria-labelledby="<id>-heading"`. Mobile glyph: `LayerGlyph.tsx`, server-rendered.
5. **`StackDive.tsx`** composes them; GSAP is reached only through `use-stack-dive`.

**Acceptance (`services-dive.spec.ts`)**

- For each anchor: `/services#cloud` puts the `#cloud-heading` in the viewport below the sticky header, and the visual's `data-active-layer="cloud"` is set.
- Keyboard: tabbing through every link inside the sections keeps focus visible and not covered.
- Reduced motion or 768 px: no `html.lenis` class, no ScrollTrigger instances, glyphs visible.
- CLS under 0.1, TBT under 200 ms on `/services`.
- Services total JS is 150 kb or less (GSAP+ScrollTrigger about 40 kb and Lenis about 5 kb, lazy).

Risk: **High**.

### Phase 5: How we work, contact and blog polish

1. **`ProcessTimeline`** with an adapted tracing beam (`@aceternity/tracing-beam` → `m`, `useScroll`). Reduced motion: a static full beam.
2. **`PrinciplesGrid`** bento and the `id="principles"` anchor that the hero chips link to.
3. **`FaqList`** styling with the details animation. A test checks that find-in-page text is present in the HTML when closed.
4. **Contact polish.**
5. **Blog:**
   - `AnchorHeading` copy-link affordance;
   - optional `PostToc` (1280 px and up, IntersectionObserver scroll-spy, tiny island);
   - optional code copy button (tiny island);
   - next/prev links;
   - optional diagram draw-in via CSS view timelines.

**Acceptance:** `blog.spec.ts` checks:

- highlighted token spans are present;
- the table region is focusable;
- heading anchors resolve;
- the post route ships 0 animation-runtime JS (budget script asserts no `motion`, `gsap` or `ogl` chunks).

### Phase 6: Hardening and launch

1. **Visual baselines.**
   - `tests/e2e/visual.spec.ts`: `toHaveScreenshot` for every route at 320/768/1024/1440, captured under `reducedMotion: 'reduce'` with canvas masked.
   - Baselines are generated in the Playwright Docker image (Linux) to avoid font-rendering drift.
   - Add 375 and 1920 overflow checks.
2. **Lighthouse CI.** `@lhci/cli` with `lighthouserc.cjs` against the prod server, covering `/`, `/services`, `/how-we-work`, `/contact` and one post. Assertions: LCP < 2500, CLS < 0.1, TBT < 200, FCP < 1500, script ≤ 150 kb, stylesheet ≤ 30 kb.
3. **Cross-browser smoke** on Firefox and WebKit (routes, form, reduced motion, services anchors).
4. **Manual accessibility pass:**
   - VoiceOver (Safari) and NVDA (Firefox) on home, services and a post;
   - 200% zoom and 320 px reflow;
   - text spacing;
   - contrast sampled over the WebGL glow from screenshots.
5. **Cloudflare deploy checklist** (`docs/deploy.md`, or the existing docs location):
   - build command `npm run build`, output `out/`;
   - Email Obfuscation OFF, Rocket Loader OFF, Auto Minify OFF;
   - `_headers` applied;
   - `www` → apex 301 (DNS CNAME plus a Redirect Rule) — an infra note;
   - deploy a preview and run the parity and CSP specs against the preview URL;
   - cut over;
   - resubmit the sitemap in Search Console.

### Phase 7 (stretch, budget-gated): particle coalescence at the CTA

`src/components/cta/ParticleCoalesce.tsx` reuses the `create-*-renderer` pattern and the shared ogl chunk. Particles start scattered and settle into the stacked-layer mark on CTA in-view, finishing within 5 s. It ships **only if** home total JS stays at 150 kb or less and TBT under 200 ms. Otherwise it is cut.

---

## 5. Dependencies between steps

```
0.1 → 0.2 → (1.1, 1.2, seo-parity spec)
0.3 → all unit TDD
0.4 → csp.spec, prod e2e, Lighthouse
0.5 → every phase's acceptance
Typography decision → 1.3 → 1.4 → 1.6
1.5 → 1.6 (forms used on home/contact) → 3.6
1.7 spike → 1.7 migration → 5.5
1.8, 1.9 depend on 1.6/1.7 output (need built HTML)
2.1 → 2.3, 3.x, 4.x, 5.1
2.2 → 2.3 → 7
3.1 (registry intake) → 3.2–3.6, 4.3, 5.1
4.1 → 4.2 → 4.3/4.4 → 4.5
Phase 6 after 1–5; Phase 7 after 6 budget numbers
```

Phases 2, 3, 4 and 5 can run in parallel after Phase 1 once 2.1 and 3.1 are merged.

---

## 6. Performance budget plan

| Route                      | Initial JS (gz)                | Total JS incl. idle/lazy (gz) | CSS (gz) | Animation runtime allowed                                          |
| -------------------------- | ------------------------------ | ----------------------------- | -------- | ------------------------------------------------------------------ |
| `/`                        | ≤ 130 kb                       | ≤ 150 kb                      | ≤ 30 kb  | motion (`m` + async domAnimation), ogl after idle                  |
| `/services`                | ≤ 130 kb                       | ≤ 150 kb                      | ≤ 30 kb  | motion, gsap+ScrollTrigger+lenis (lazy, 1024 px and up, motion on) |
| `/how-we-work`, `/contact` | ≤ 125 kb                       | ≤ 140 kb                      | ≤ 30 kb  | motion only                                                        |
| `/blog`, posts, legal      | framework + islands (≤ 110 kb) | same                          | ≤ 30 kb  | none                                                               |

Strategy:

- **Measure the framework baseline in Phase 0** and set exact numbers in `budgets.json` (estimated 95–105 kb for Next 16 + React 19.2).
- If headroom on `/` is under 40 kb, swap motion on the home page for CSS + IntersectionObserver. Counters and decrypt then use small rAF utilities.
- No Lenis and no GSAP on home: it has no scrubbed timelines. Lenis is scoped to `/services` only.
- Reveals use CSS view timelines (0 kb JS). Shiki runs at build time (0 kb).
- WebGL:
  - load after idle and in view;
  - DPR cap 1.5 (1 on mobile);
  - render at 0.5–0.75 scale;
  - one draw call;
  - pause when offscreen or the tab is hidden;
  - adaptive quality with fallback to the poster.
- LCP:
  - the h1 is server-rendered with no opacity entrance;
  - next/font preloads only the display weight/axis file, with automatic fallback metrics (`adjustFontFallback`) to stop CLS;
  - no hero raster image.
- INP: no scroll handlers (IntersectionObserver or ScrollTrigger only); GSAP runs only in scrub; form handlers are light.
- CLS: sticky (not pinned) services visual; posters at fixed size; reserved heights for the ticker and terminal (the final text is always in the HTML).
- `content-visibility: auto` with `contain-intrinsic-size` on home sections 4–7.
- CI gates: `npm run budget` plus LHCI assertions.

---

## 7. Accessibility and reduced-motion plan

What each component does in each mode. "Reduced" means OS reduced motion or `data-motion="off"`.

| Component                       | Full motion                     | Reduced / toggle off                     | No JS          |
| ------------------------------- | ------------------------------- | ---------------------------------------- | -------------- |
| LightPillar                     | ogl canvas, pause button        | Static poster, no canvas created         | Poster         |
| Principle chips                 | Hairline draw + float           | Static                                   | Static list    |
| Stack marquee                   | Scrolling, pause on hover/focus | Static wrapped list                      | Static list    |
| Data facts                      | Ticker / decrypt in view        | Final values                             | Final values   |
| Process pipeline / tracing beam | Pulse / scroll-filled beam      | Full static beam, all stages "passed"    | Same           |
| Findings terminal               | Types once, under 5 s           | Fully printed                            | Printed        |
| Border beam                     | Runs on focus-within            | Static 1 px teal border on focus         | CSS focus ring |
| Services dive                   | Sticky visual, GSAP, Lenis      | Stacked sections + glyphs, native scroll | Same           |
| FAQ                             | details + height animation      | Instant toggle                           | Works (native) |
| Reveals                         | CSS view timeline               | None (visible)                           | Visible        |
| Reading progress                | CSS scroll timeline             | Static (hidden)                          | CSS-only       |

Also:

- **WCAG 2.2.2:** a global footer toggle (persisted in localStorage), a hero pause button, and the marquee pauses on hover and focus.
- **Semantics:** one h1 per page; landmarks (`header`/`nav[aria-label]`/`main#main-content`/`footer`); breadcrumbs as `nav[aria-label=Breadcrumb] ol` with `aria-current`; decorative canvases and SVG visuals `aria-hidden`; diagrams keep `role=img` with `<title>`/`<desc>`.
- **Animated text:** DecryptedText and NumberTicker render a visually hidden real string next to `aria-hidden` animated glyphs.
- **Form:** sr-only label, `role="status"` live region, errors joined by `aria-describedby`, focus stays on the input after an error.
- **Focus:** a consistent visible ring; `scroll-padding-top` so the sticky header never covers focus (2.4.11); targets at least 24 px (2.5.8).
- **Contrast:** token pairs verified (section 2); a scrim and placement rule for text over the glow; Shiki theme checked to AA.
- **Tests:** axe on every route in both motion modes; `keyboard.spec.ts` (skip link, tab order, focus visible and not covered); manual screen-reader pass in Phase 6.

---

## 8. SEO and URL preservation plan

- **URLs:**
  - `trailingSlash: false`, so the export writes `services.html`, which Cloudflare serves at `/services`.
  - Match the trailing-slash and `.html` behaviour recorded from the live site in 0.1.
  - Internal links stay identical.
- **Anchors:**
  - service ids, `#step-1..4` and all post heading ids are preserved (explicit `{#id}` syntax);
  - `#principles` is new;
  - `seo-parity.spec.ts` checks every legacy id.
- **Head parity** (via `buildPageMetadata`, compared against `inventory.ts`):
  - exact `<title>`s, including the SEO titles on posts and services that differ from the h1;
  - description, canonical, robots variants (including `max-image-preview:large, max-snippet:-1`);
  - home `keywords`, `author`, `theme-color`;
  - OG/Twitter with the legacy image URLs and alt text;
  - `article:*` on posts;
  - the RSS alternate link.
- **JSON-LD:** same `@graph` structures and `@id`s (Organization with OfferCatalog, WebSite, WebPage, BreadcrumbList, FAQPage, ContactPage, Blog, BlogPosting with `wordCount` and `keywords`). Parsed and compared in tests.
- **Generated files:**
  - `sitemap.xml` from `sitemap.ts`, diffed against the live one (same URL set);
  - `robots.txt` a static, byte-identical copy (allows all, including AI crawlers);
  - `/blog/feed.xml` regenerated with the same item GUIDs/links as live;
  - `404.html` emitted.
- **Assets:** `/images/og.png`, `/images/blog/*.png`, `/favicon.svg`, `/apple-touch-icon.png` and `/logo.svg` all return 200.
- **Infra:** add `www` CNAME + 301 to apex. Turn off Email Obfuscation, Rocket Loader and Auto Minify.
- **After launch:** resubmit the sitemap; watch Search Console coverage and rich results (FAQ, breadcrumbs) for 2 weeks.

---

## 9. Testing plan

**Unit tests (Vitest, 80% minimum on lib/content/hooks), co-located `*.test.ts`:**

- `src/content/*.test.ts`: integrity and copy parity
- `src/lib/content/{rich-text,stack-union,ordered-services}.test.ts`
- `src/lib/seo/{metadata,json-ld}.test.ts`
- `src/lib/lead/{submit-lead,validate-email}.test.ts`
- `src/lib/feed/build-rss.test.ts`
- `src/lib/webgl/{capability,quality}.test.ts`
- `src/lib/motion/stack-progress.test.ts`
- `src/hooks/*.test.ts`
- `scripts/postbuild-headers.test.mjs`: hash extraction and rule generation

**Playwright (`tests/e2e/`). Dev group for quick runs, prod group (static server + `_headers`) for the real gates:**

- `routes.spec.ts`: all URLs 200, 404 page, assets
- `seo-parity.spec.ts`: head, JSON-LD, ids against the legacy inventory
- `lead-form.spec.ts`: mocked success, network error → mailto, 20 s timeout via `page.clock`, no-JS post
- `reduced-motion.spec.ts`: `emulateMedia({ reducedMotion: 'reduce' })` and the toggle, on every route
- `hero-webgl.spec.ts`: idle load, fallback, pause offscreen, pause button
- `services-dive.spec.ts`: deep links, active layer, keyboard, mobile/reduced layout
- `blog.spec.ts`: highlighting, table region, anchors, zero animation runtime
- `a11y.spec.ts`: axe on every route in both motion modes (replaces the axe test in `home.spec.ts`)
- `keyboard.spec.ts`
- `csp.spec.ts`: no CSP console violations
- `visual.spec.ts`: 320/768/1024/1440 (+375/1920 overflow), reduced motion, canvas masked, Linux baselines
- `home.spec.ts` (existing): keep the h1 and overflow assertions
- Firefox and WebKit run the smoke subset.

**Performance:** `npm run budget` (per-route gz JS/CSS) and `lhci autorun`, both in CI.

**Workflow mapping:** each step writes its unit or e2e spec first and confirms it fails, then implements, then runs code-reviewer. Form, headers and CSP also get security-reviewer.

---

## 10. Risks

**HIGH**

- **Home JS budget** (framework + motion + ogl near 150 kb).
  - Mitigation: Phase 0 baseline; CSS-first reveals; no GSAP or Lenis on home; ogl loaded after idle with a minimal import set; async LazyMotion features; budget gate in CI; drop motion from home if headroom is under 40 kb.
- **Services dive vs anchors, Lenis, CLS and keyboard.**
  - Mitigation: sticky visual with content in normal flow (no pinning); `gsap.matchMedia`; Lenis `anchors: true` on one page only; deep-link and keyboard e2e tests; a pure progress-mapping function under unit test.
- **CSP on a static export** (inline Next scripts, no nonces).
  - Mitigation: post-build per-route sha256 hashes in `_headers`; prod-server CSP spec; check Cloudflare line and rule limits. `'unsafe-inline'` for scripts is a documented last resort only.
- **Cloudflare HTML rewriting** (email obfuscation, Rocket Loader) breaking hydration or hashes.
  - Mitigation: turn them off (the deploy checklist); a parity test against the preview deployment.
- **Lead form regression** (it is the conversion path).
  - Mitigation: progressive-enhancement form rendered on the server; unit and e2e tests including no-JS; copy taken from the real `forms.js`; preview test with a real submission before cutover.

**MEDIUM**

- **Registry components** (`motion.*` under `LazyMotion strict`, three.js in LightPillar, hydration-unsafe randomness, licences).
  - Mitigation: an adaptation checklist at 3.1; a hand-written ogl port; licence review in 0.6.
- **MDX plugins under Turbopack; keeping heading ids.**
  - Mitigation: a spike first; string plugins with JSON options; fallback `next build --webpack`; id parity test.
- **WebGL on low-end, battery or blocklisted GPUs; context loss.**
  - Mitigation: capability check with `failIfMajorPerformanceCaveat`; adaptive quality; poster fallback; pause offscreen.
- **Text contrast over the glow.**
  - Mitigation: placement rule plus scrim; contrast sampled from screenshots.
- **Visual-regression flakiness.**
  - Mitigation: reduced-motion baselines, masked canvas, Docker Linux baselines, deterministic waits (no timeouts).
- **Font change** affecting brand perception and LCP.
  - Mitigation: your decision; a single variable file; automatic fallback metrics.
- **Next 16 API differences.**
  - Mitigation: read `node_modules/next/dist/docs` at every framework step (metadata, fonts, route handlers, MDX).

**LOW**

- Clean-URL and trailing-slash differences: recorded live behaviour plus a static server that mimics Cloudflare.
- Feed and sitemap generation under `force-static`: unit-tested builders, diffed against live.
- Copy drift during the rebuild: copy-parity assertions from the legacy fixtures.
- `www` DNS: an infra checklist item.

---

## 11. Complexity estimate

Overall: **High**. Solo estimate:

| Phase                                    | Effort                                   |
| ---------------------------------------- | ---------------------------------------- |
| P0 Guardrails                            | 1.5 d                                    |
| P1 Content, shell, SEO, forms, blog, CSP | 6–7 d                                    |
| P2 Motion infrastructure + hero          | 3.5–4.5 d                                |
| P3 Home section motion                   | 3 d                                      |
| P4 Services dive                         | 4–5 d                                    |
| P5 How-we-work, contact, blog polish     | 2.5–3 d                                  |
| P6 Hardening + launch                    | 2.5–3 d                                  |
| **Total**                                | **about 23–27 dev-days (4.5–5.5 weeks)** |
| P7 Particle CTA (stretch)                | +2 d                                     |

---

## 12. Open questions

1. **Typography:** go with Archivo variable (`wdth` + `wght`) + IBM Plex Mono, replacing Roboto (my recommendation)? Or Plex Sans + Plex Mono, or keep Roboto?
2. **FAQ:** native `<details name="faq">` styled like Animate UI (keeps answers in the HTML, find-in-page, zero JS), or the Radix-based Animate UI accordion as originally agreed?
3. **Service order:** use the request-path stack order (Product → API → Scale → Automation → Cloud, with AI as a rail) on /services _and_ the home list? Or keep the current order (Backend, Scale, Cloud, Product, Automation, AI) on the home page?
4. **Lenis scope:** only on `/services`, not site-wide (my recommendation, for budget and blog readability)?
5. **Cloudflare:** is this Pages or Workers Static Assets? Can you turn off Email Obfuscation, Rocket Loader and Auto Minify, and add the `www` → apex redirect?
6. **Anti-abuse:** add a honeypot field to the lead form? It needs a matching small change in the Apps Script, which is outside this repo.
7. **Live fetches:** OK for me to download `forms.js`, OG images, favicon/touch icon, `sitemap.xml`, `robots.txt` and `feed.xml` from the live site in Phase 0?
8. **Motion toggle:** is a global "Motion: on/off" control in the footer acceptable (WCAG 2.2.2), stored in `localStorage` (no cookie)?
9. **Blog extras:** sticky table of contents, code copy buttons, diagram draw-in. Want any of these?
10. **Stretch goal:** include the particle-coalescence CTA if the budget allows, or drop it now?
11. **CI:** GitHub Actions (for budgets, LHCI, Docker visual baselines), or something else?
12. **Docs location:** is there a preferred place for `third-party.md` and the deploy checklist (AGENTS.md says to ask before creating a new top-level docs location)?

WAITING FOR CONFIRMATION
---

## 13. Decisions (2026-10-05)

| Question               | Decision                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography             | Archivo variable (`wght` + `wdth`) + IBM Plex Mono; Roboto removed                                                                                                                    |
| FAQ                    | Native `<details name="faq">` with Animate UI visual treatment                                                                                                                        |
| Service order          | Request-path order everywhere: Product → API → Scale → Automation → Cloud, AI as a rail; anchors unchanged                                                                            |
| Particle CTA (Phase 7) | Kept as budget-gated stretch                                                                                                                                                          |
| Defaults accepted      | Live asset fetches in Phase 0; Lenis on `/services` only; footer motion toggle in localStorage; GitHub Actions CI; docs in `docs/`; no honeypot yet; blog TOC / copy buttons deferred |
| Pending (by Phase 6)   | Cloudflare Pages vs Workers; disable Email Obfuscation / Rocket Loader / Auto Minify; `www` → apex 301                                                                                |

### Budget (Phase 0 measurement, corrected)

An empty Next 16 + React 19.2 page loads **130.3 kb gz** of JS in a modern browser. (An earlier reading of 169 kb wrongly counted Next's `noModule` legacy polyfill, which modern browsers never download; the checker now skips it.) The user's 150 kb landing rule therefore stands, and `budgets.json` enforces it:

| Route            | Initial JS (gz)              | Total incl. lazy (gz)                  | CSS (gz) |
| ---------------- | ---------------------------- | -------------------------------------- | -------- |
| `/`, `/services` | ≤ 140 kb (+10 over baseline) | ≤ 150 kb (+20), asserted in Playwright | ≤ 30 kb  |
| all other routes | ≤ 140 kb                     | ≤ 140 kb                               | ≤ 30 kb  |

Consequence (plan §6 fallback triggers, headroom on `/` < 40 kb): the home page uses **CSS view-timeline reveals, IntersectionObserver and small rAF utilities instead of the `motion` library**. `motion` (`m` + LazyMotion, ~5 kb up front, ~15 kb of async features) is used on another route only where the budget check shows it fits; registry components that need it are rewritten to CSS/rAF otherwise. Home's only lazy runtime is the minimal `ogl` import set for the hero, loaded after idle. GSAP + ScrollTrigger + Lenis on `/services` (~45 kb) exceed +20 kb, so the services dive must use **CSS `position: sticky` + scroll-driven animations (`animation-timeline: view()`) with an IntersectionObserver for the active layer**, falling back to GSAP only if the effect cannot be achieved and the budget is revisited with the user.

### Phase 1 outcome (2026-10-06)

Shipped as planned, with these deviations:

- `next/link`, `next/image` and `usePathname` dropped (≈30 kb gz of client code); plain links do full page loads from the CDN. Header is rendered per page with `currentPath`.
- Post heading ids use explicit JSX `<H2 id>` (MDX treats `{#id}` as an expression). Migrated text, links and code samples are verified identical to the legacy posts.
- Root canonical/og:url render as `https://prodbuilds.com` (Next normalises the root); equivalent to the legacy `https://prodbuilds.com/`.
- Security headers: per-route sha256 CSP plus a script-less baseline CSP on `/*` (covers the 404 page); `connect-src`/`form-action` pinned to the exact Apps Script URL; HSTS without `includeSubDomains` until subdomains are audited; COOP same-origin.
- Lead form: validation matches native `type=email`; `credentials: "omit"` (no Google cookies sent); `maxLength` 254.
- Open for the user: the privacy policy does not name Google (Apps Script) as the processor of submitted emails; Apps Script should length-cap input, neutralise spreadsheet formula injection and throttle.

### Phase 2 outcome (2026-10-06)

- Footer motion switch (localStorage, never a cookie) plus an inline `<head>` boot script so a stored "off" applies before first paint; scroll reveals and reading progress respect it and the OS setting.
- Hero light pillar: original GLSL in one fullscreen pass, on raw WebGL (`src/lib/webgl/fullscreen-pass.ts`). `ogl` was dropped: it pushed home to 150.8 kb; now 139.4 kb incl. the lazy chunk.
- Loads only after idle, in view and with motion allowed; pauses offscreen, in hidden tabs and via a pause button (WCAG 2.2.2); adaptive render scale, poster fallback on slow frames, no hardware WebGL, Save-Data or context loss.
- Review fixes before commit: redraw on resize while paused; import race could leave the hero on the poster; no GL probe during hydration; `pow()` with a negative base in the shader; footer toggle no longer makes a claim in static HTML; constant toggle names.
- Privacy policy now names Google Apps Script; per-page `updated` dates (home and blog follow the newest post).

### Phase 3 outcome (2026-10-06)

- No registry components or `motion`: the home page had ~10 kb of JS headroom, so every effect is CSS plus one shared hook (`usePlayProgress`: once, in view, motion allowed) and pure frame functions in `src/lib/motion/`. Home initial JS 139.3 kb (cap 140), ~142 kb with the lazy WebGL chunk.
- `StackMarquee`: CSS only, built from `stackUnion(services)`; a static wrapped list unless motion is allowed; `aria-hidden` copy; pauses on hover, on focus and with a CSS-only "Pause scrolling" checkbox (WCAG 2.2.2 without relying on the footer toggle).
- `DataFacts`: "Never" decrypts (letters of the same case only, clipped, so it never spills), "30" counts up. The real value stays in the DOM, transparent while an `aria-hidden` overlay plays.
- `ProcessPipeline`: stages run queued → running → passed (`data-stage-state`), 700 ms each; per-stage connector segments fill with `transform`, exact in both orientations.
- `FindingsTerminal`: types measured results from the three posts (`src/content/findings.ts`; commands illustrative, results verbatim) in ~4.3 s (unit-tested under 5 s); solid cursor, no blinking; every character is always laid out, so typing never shifts layout.
- Border beam on the lead form's email field: rotating conic gradient masked to a 1 px ring, only on hover/focus.
- Review fixes before commit: pipeline status labels share one grid cell (no wrap/CLS mid-run at 1024 px, e2e-checked); re-enabling motion mid-run restarts cleanly instead of flashing a stale frame; the in-view hook reads the latest IntersectionObserver entry; facts print their real values; the local static server drops `upgrade-insecure-requests` (WebKit applies it to `http://localhost`; production is https-only).
- Tests: `reduced-motion.spec.ts` (OS setting and toggle off: final content, no running animations, axe) and `home-motion.spec.ts` (start states, runs, hover pause, beam, axe with motion on).

### Phase 4 outcome (2026-10-07)

- Built as approved in §13: CSS `position: sticky` + an IntersectionObserver, no GSAP or Lenis. `/services` JS 134.3 kb gz.
- `StackVisual` is a real "jump to layer" `<nav aria-label="Layers of the stack">`: five slab links plus the AI rail, `aria-current` on the layer whose section crosses a line 30% down the viewport (`useActiveSection`), a depth-gauge needle, a decrypting HUD readout (`useDecryptedText`) and beams from the rail into L0/L1 when AI is active. Works as plain anchors without JavaScript.
- Deviation from the original plan: the sticky navigation also shows with reduced motion or the toggle off (state changes are instant; only the transitions are gated). Below 1024px each section keeps its server-rendered `LayerGlyph`, and the observer and decrypt don't run.
- Sections stay in normal flow (nothing pinned); legacy ids and `aria-labelledby` unchanged.
- Review fixes before commit: the active line moved from the centre to 30% (at 1440×2000 a deep link to `#product` marked Backend and `#ai` marked nothing); the sticky nav is capped to the viewport height and scrolls inside itself (on screens under ~545px tall the lower layers were unreachable); the readout wraps at 1024px; the needle hides while the AI rail is active; the scroll-linked progress fill was dropped (it disagreed with the needle); no flash of plain text between readout changes; a stable observer key.
- Tests: `services-dive.spec.ts` (deep links for every layer, link navigation, stickiness, keyboard focus not under the header, CLS, reduced motion, no-JS, 1440×2000 and 1024×480 viewports, glyphs below 1024px).
