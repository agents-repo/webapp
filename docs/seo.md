# SEO

This document describes search-engine and social-preview expectations for the
Agents Repo webapp. **Accessibility requirements take precedence** — see
[accessibility.md](accessibility.md) for page titles, announcements, and UI
patterns. SEO work is additive and must not replace those mechanisms.

## Precedence

| Concern | Owner | SEO layer |
| --- | --- | --- |
| Page title | `RouteDocumentTitle` | `buildRouteHead`; `SiteHead` for OG/Twitter |
| Route labels | `sitePageMeta` | `siteSeoMeta` |
| Semantic HTML | Page components | Shared wins — do not regress |

## Architecture

Reusable SEO helpers live in `src/modules/site/application/seo/`:

| Module | Role |
| --- | --- |
| `siteSeoMeta.ts` | Per-route descriptions and canonical paths |
| `siteSeo.ts` | Site origin, OG image constants |
| `buildRouteHead.ts` | Build-time `<title>` and crawler head tags; shared data for `SiteHead` |
| `SiteHead.tsx` | Runtime SEO meta tags on client-side route changes (not `<title>`) |

**Runtime (SPA navigation):** `SiteHead` updates meta tags when users move
between routes. It does **not** set `<title>`.

**Build (GitHub Pages):** `npm run prefetch:package-site-routes` fetches live
`packages/index.json` after resolving a major-version alias such as `v2.x` to
the latest stable registry tag (same resolution as runtime catalog loading).
`npm run prefetch:package-details` fetches each package `detail.json` for
markdown fallbacks. Production uses the proxy (`ref` query); `--mode e2e` uses
Playwright fixtures. A failed fetch or schema mismatch **fails the production
Pages build**. It writes gitignored `scripts/.generated/package-site-routes.json`,
`package-site-catalog.json`, and `package-site-details.json`. The routes list
feeds `getBuildSiteRoutePaths()` and `getBuildSitemapPaths()` in
`vite.config.ts`; catalog and detail snapshots are consumed by
`scripts/prepare-pages-dist.mjs` and `scripts/copy-doc-markdown.mjs`.
`prepare-pages-dist.mjs`
injects route-specific head tags into `dist/**/index.html`, including package
JSON-LD `codeRepository` from `VITE_REGISTRY_GITHUB_REPOSITORY_URL` for the
build mode (not a hardcoded default). `404.html` uses a
separate `noindex` fallback head for unknown paths.

**Public URL form (GitHub Pages):** Directory routes are emitted as
`dist/<segments>/index.html`. GitHub Pages **301s** `/about` to `/about/` (the
200 URL). Canonical, `og:url`, JSON-LD `url`, sitemap `<loc>`, and in-app
`Link`/`NavLink`/`Navigate` hrefs MUST use that trailing-slash form via
`publicSitePath()` in `siteRoutes.ts`. Home stays `/`. File URLs stay unslashed
(`/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/docs/<slug>.md`, and locale-prefixed
`/es/docs/<slug>.md`, `/pt-br/docs/<slug>.md`, `/pt-pt/docs/<slug>.md`). Route ids
(`siteRoutes`, `canonicalPath`, `getBuildSiteRoutePaths()`) stay unslashed so
`prepare-pages-dist.mjs` can write folder HTML. `prepare-pages-dist.mjs` also
rewrites sitemap `<loc>` values after `vite build` in case `vite-plugin-sitemap`
strips trailing slashes.

**Crawl files:** `vite-plugin-sitemap` in `vite.config.ts` generates
`dist/sitemap.xml` and `dist/robots.txt` at the end of `vite build`. Routes come
from `getBuildSitemapPaths()` (locale-expanded static/docs/repository/package paths);
`hostname` uses `VITE_SITE_URL`
through `scripts/seo-build-config.ts` (shared with `prepare-pages-dist.mjs`) so
`.env` values match the client bundle.
The plugin also injects `<link rel="sitemap" href="/sitemap.xml">` into
`index.html`. `SiteHead` emits `noindex` for unknown paths at runtime (matching
the `404.html` fallback).

**Browser access:** The PWA service worker excludes `/sitemap.xml`,
`/robots.txt`, `/llms.txt`, and doc markdown (`/docs/*.md` plus locale-prefixed
`/es/docs/*.md`, `/pt-br/docs/*.md`, `/pt-pt/docs/*.md`) from HTML `NetworkFirst` caching
(`isHtmlNavigationRequest` in `scripts/pwa-workbox.ts`, wired in
`vite.config.ts`) so browser navigation serves the static crawl files instead of
the SPA shell. `navigateFallback` is disabled so those files are not replaced by
precached `index.html`. These files are
generated after the service worker manifest is built, so they are not
precached via `includeAssets`. `npm run dev` does not
generate crawl files; use `npm run build:pages && npm run preview` to test
locally.

**Validation:** `npm run test:crawl-files` verifies `dist/sitemap.xml`,
`dist/robots.txt`, and `dist/sw.js` after `npm run build:pages`. It is read-only
against `./dist` and must not run `vite build` or otherwise mutate build
output. Origin
resolution for `VITE_SITE_URL` is covered by `test/seo-build-config.test.mjs`
in `npm run test`. Deploy workflows run `npm run assert:production-crawl-origin`
before publish.

## Shared accessibility wins

These patterns already help SEO and must stay in place:

- `lang="en"` on `<html>`
- One `<h1>` per page and a single semantic `<main id="main-content">` in `src/App.tsx`
- Header and footer internal links to all public routes
- Skip link and route announcer (accessibility-first; no SEO-specific changes)

## Industry checklist

| Pattern | Implementation |
| --- | --- |
| Self-referential canonical (absolute URL) | `buildRouteHead()` + `publicSitePath()` |
| `og:url` matches canonical | Same builder function |
| Absolute `og:image` | `getOgImageUrl()`; `/og/*.jpg` for routed pages; fallback `/og-image.jpg` |
| OG image dimensions and alt | `og:image:width`, `og:image:height`, `og:image:alt` |
| Twitter large image card | `twitter:card=summary_large_image` |
| Twitter site handle | `twitter:site` from the X catalog URL (`@AgentsRepo`) |
| Meta description (~150–160 chars) | `siteSeoMeta` per route |
| Page `title` vs `routeLabel` | Locale `seo.json`: marketing `title`; short `routeLabel` |
| Package detail social description | `getPackageDetailShareSeoDescription` (og/twitter only) |
| `robots.txt` allows crawl + sitemap | Generated by `vite-plugin-sitemap` in `vite.config.ts` |
| Sitemap with canonical URLs only | Generated by `vite-plugin-sitemap` in `vite.config.ts` |
| JSON-LD `WebSite` + `Organization` | Home only; Organization `sameAs` lists GitHub, X, Reddit |
| JSON-LD `CollectionPage` | `/packages` and `/packages/:namespace` |
| JSON-LD `SoftwareSourceCode` | Package detail; `codeRepository` when a GitHub browse URL exists |
| JSON-LD `WebPage` | Other public routes |

Catalog listing query params (`q`, filters, `period`, `page`) are client
listing state. They are not extra CollectionPage routes. Do not emit GitHub
Pages HTML shells or sitemap entries for `?page=N`. Package **detail** paths
remain the per-item crawl surface.

Do **not** block JavaScript or CSS in `robots.txt` — Google needs assets to
render pages.

## Open Graph images

Social previews use **1200×630 JPEGs**. Meta tags reference absolute URLs via
`getOgImageUrl()` in `siteSeo.ts`. Two pipelines:

### Pages OG (committed; phases 1–2)

Human-maintained cards for fixed site routes — **not** generated during
`npm run build:pages`.

| Route (canonical path) | Public asset | Notes |
| --- | --- | --- |
| `/` (home) | `/og/home.jpg` | Route-specific card (phase 2) |
| `/packages` | `/og/packages.jpg` | Packages **index** hub (phase 2); not catalog detail JPEGs |
| `/docs` | `/og/docs.jpg` | Docs hub card (phase 2) |
| All other public routes (except package detail below) | `/og-image.jpg` | Site default (phase 1) |

| Concern | Policy |
| --- | --- |
| Generation | `npm run og:generate` after template or logo edits |
| Drift check | `npm run og:check` (PR baseline when OG paths change) |
| Artifacts | `public/og-image.jpg`, `public/og/*.jpg`, fingerprint `.sha256` files |

### Package catalog OG (build-time; phase 3)

One JPEG per **listed** package **detail** route (`/packages/:namespace/:packageId`).
Generated during `npm run build:pages` / `prepare-pages-dist` from the same prefetch
catalog snapshot as package site routes. Output URL path:
`/og/packages/{namespace}/{packageId}.jpg` (under `dist/og/packages/…` on deploy).
**Not** committed to git. Incremental cache:
`scripts/.generated/og-packages-cache/` (gitignored).

| Concern | Policy |
| --- | --- |
| Generation | Automatic on `build:pages` only |
| Drift check | `packages.template.sha256` (scripts + logo); catalog JPEGs on `build:pages` |
| `og:generate` | Pages JPEGs + fingerprints only (not catalog detail JPEGs) |

Locale-prefixed URLs (for example `/es/docs/`) use the same OG image as the English
canonical route.

| Concern | Policy |
| --- | --- |
| Format | JPEG only (smaller bytes; unfurl reliability) |
| Template | `scripts/og/` (Satori + `@resvg/resvg-js` + `sharp` devDependencies) |

After editing **pages** templates, run `npm run og:generate`, commit all JPEGs and
fingerprint files, and smoke-test unfurls (X, LinkedIn, Slack). Keep each file well
under 300 KiB (`scripts/og/constants.mjs` enforces a check-time limit). Catalog
detail cards refresh on the next successful site deploy after registry catalog changes.

**Safe zone:** Route card layouts in `scripts/og/route-card-layout.mjs` use
`ogCardSafeZone` in `scripts/og/constants.mjs` — extra bottom padding (~45px above
the canvas edge) so footer pills are less likely to be cropped on X
`summary_large_image` cards. Keep new artwork inside the same margins.

## Auditing dev vs production

Third-party SEO scanners sometimes report issues that do not match what GitHub Pages
ships:

| Signal | Dev (`npm run dev`, root `index.html`) | Production (`npm run build:pages` → `dist/`) |
| --- | --- | --- |
| `<title>` / `og:*` | Vite shell until navigation | Per-route `dist/**/index.html` head injection |
| `<h1>` | Empty `#root` until hydrate | `<noscript>` + SPA `<main>` each expose one `<h1>` |
| `og:description` length | Matches `/` after load | Home ~131 chars; within ~150–160 meta target |

When validating findings, prefer **`dist/index.html`** (home) or the live site over the
dev shell. Tools that do not execute JavaScript and ignore `<noscript>` may still flag
“missing H1” on SPAs; that is expected unless you enable JS rendering in the crawler.

Contributor workflow and third-party build-tool licenses are documented in
[development.md](development.md#open-graph-image-generation).

## Per-route checklist

When adding a public route:

1. Add the path to `siteRoutes.ts` (or extend the repository or docs manifest
   and `getSiteRoutePaths()` for `/repositories/:slug` or `/docs/:slug` pages).
   Package catalog routes are generated at build time from the live registry
   index (`/packages`, `/packages/:namespace`, `/packages/:namespace/:packageId`).
2. Add accessibility metadata to `sitePageMeta.ts` (`title`, `routeLabel`), or
   ensure manifest-driven pages resolve via `getSitePageMeta()`
3. Add SEO metadata to `siteSeoMeta.ts` (`description`, `canonicalPath`), or
   ensure manifest entries supply descriptions for detail routes
4. `RouteDocumentTitle` reads `getSitePageMeta()` — no per-page title hook required
5. Run `npm run build:pages` and confirm the new route appears in `dist/sitemap.xml`
   with a trailing-slash `<loc>` (except `/` and file URLs) and, for nested paths,
   under `dist/<segments>/index.html` from `prepare-pages-dist.mjs`
6. Run `npm run a11y:ci` locally to verify Lighthouse SEO on the new route

Unknown `/repositories/:slug` values are not listed in `getSiteRoutePaths()`;
they redirect to `/repositories` and receive `noindex` at runtime until
redirect.

Unknown `/packages/...` paths show an in-app **Package not found** page (they do
**not** silently redirect to Home) and receive `noindex`. While the catalog is
still loading, including a one-time membership recheck against a freshly
resolved registry line, valid-looking `/packages/:namespace` and
`/packages/:namespace/:packageId` paths are not marked `noindex` yet. After that
load attempt finishes, membership in the live index controls indexability so
packages published after the last webapp deploy still get runtime SEO/analytics
on client navigation. They enter the sitemap on the next successful
`build:pages`.

### Site doc markdown and `llms.txt`

Site docs also register `/docs` and `/docs/:slug` routes via the docs
manifest (`getSiteRoutePaths()`). Raw markdown is served at `/docs/<slug>.md`
(copied during `npm run build`). `llms.txt` at the site root lists all site doc
`.md` URLs for agents.

The PWA service worker excludes `/llms.txt` and `/docs/*.md` from HTML
`NetworkFirst` matching (see `scripts/pwa-workbox.ts`) so browsers fetch
static files instead of the SPA shell.

Unknown `/docs/:slug` values redirect to `/docs` (same pattern as unlisted
repository slugs).

## Crawler and AI fallbacks (fallback-only)

Browser users keep the dynamic SPA. Build output adds **non-JS fallbacks** for
URL fetchers:

| Surface | Fallback | Generator |
| --- | --- | --- |
| Homepage `/` | `<noscript>` summary + links | `routeBodyFallback.ts` |
| Package detail HTML | `<noscript>` excerpt + `.md` link | same |
| Package content | `/packages/<ns>/<id>.md` | `copy-doc-markdown.mjs` |
| Discovery | `llms.txt` package section | `copy-doc-markdown.mjs` |

`npm run prefetch:package-details` fetches each `detail.json` once per
`build:pages` (production mode fails on error; e2e uses fixtures). Registry-proxy
cost is CI-only — crawlers read GitHub Pages static files.

The PWA service worker excludes `/packages/*.md` from HTML `NetworkFirst`
matching (see `scripts/pwa-workbox.ts`), same as `/docs/*.md`.

## SPA limitations

- GitHub Pages cannot SSR. `build:pages` fetches live `packages/index.json` and
  `detail.json` snapshots, then emits HTML shells (title, description, canonical,
  JSON-LD, `<noscript>` fallback) plus package `.md` files. Package README and
  agent/flow bodies still load dynamically in the browser for interactive users.
- Packages published after the last webapp deploy work via client navigation and
  `404.html`, but that fallback HTML is `noindex`. They join the sitemap on the
  next successful `build:pages`. Scheduled rebuilds are out of scope.
- Social crawlers read the initial HTML. Client-only meta tags (without build
  injection) are insufficient for link previews.
- **Clear cache and reload catalog** clears app IndexedDB registry stores. Browser HTTP
  cache may still serve catalog and `detail.json` for up to 300 seconds (`max-age`
  from registry-proxy).

## Environment

Optional build-time override for preview or staging canonical/OG URLs:

- `VITE_SITE_URL` — absolute origin without a trailing slash (for example
  `https://agents-repo.org`). Set in `.env` or the shell; `build:pages`
  resolves it with Vite's env loading so static HTML matches the client bundle.

When unset, production defaults to `https://agents-repo.org`.

### Analytics and GTM

- `VITE_GTM_ID` — Google Tag Manager container ID (default `GTM-57FJBZ7P` in
  `.env.production`). Controls **which** container loads, not **when**.
- Analytics loads only when `import.meta.env.MODE === 'production'` **and** the
  user has accepted analytics cookies. See [privacy.md](privacy.md).

The GTM snippet is **not** embedded in static HTML. `index.html` includes only
the Consent Mode v2 default-deny stub. GTM injects at runtime after consent.

## Analytics pageviews (SPA)

React Router navigations do not reload the page. GA4 needs explicit signals for
virtual pageviews.

### Primary approach: React `dataLayer` pushes

`pushAnalyticsPageView()` (in `analyticsPageView.ts`) pushes:

```ts
{
  event: 'page_view',
  page_path: pathname,
  page_location: `${origin}${pathname}${search}`,
  page_title: document.title,
}
```

Guards: `isProductionAnalyticsEnabled()`, consent `accepted`, known site routes
only.

`AnalyticsRouteTracker` calls this on `location` changes but **skips the initial
mount** (Accept handler and return-visitor bootstrap cover the first hit).

| Scenario | Who records the pageview |
| --- | --- |
| User Accepts on current page | Accept handler after `loadGoogleTagManager()` |
| Return visitor (consent accepted) | Bootstrap after GTM load |
| Client-side navigation | `AnalyticsRouteTracker` |

### GTM container configuration (maintainer checklist)

1. Enable consent overview in GTM.
2. GA4 tags require `analytics_storage`.
3. **Do not deploy ad tags** — this site has no advertising.
4. **Default — React pushes:** GA4 Event tag on Custom Event trigger `page_view`.
   Do not also enable History Change + auto `page_view` on load (duplicate hits).
5. **Alternative — History Change only:** GA4 tag on GTM's built-in History
   Change trigger (`pushState` / `popstate`). If you switch to this approach,
   remove `AnalyticsRouteTracker` from `App.tsx` and disable the Custom Event
   `page_view` tag — never use both.
6. Container ID matches `VITE_GTM_ID` in production env.
7. Verify in Tag Assistant: `consent default` → user choice → `consent update`
   → `gtm.js` → `page_view` on navigation.

### Verification commands

After `npm run build:pages`:

```bash
# Consent stub present in shell HTML
grep "consent', 'default'" dist/index.html

# GTM ID must NOT appear in static HTML (runtime injection only)
grep GTM-57FJBZ7P dist/index.html && echo "unexpected" || echo "ok"
```

## Validation

Run before marking the pull request ready for review when the change touches SEO:

```bash
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run test:crawl-files
npm run a11y:ci
```

| Command | Purpose |
| --- | --- |
| `npm run test` | Unit tests including `test/seo-build-config.test.mjs` (origin resolution) |
| `npm run test:crawl-files` | Read-only crawl-file and `dist/sw.js` check after `build:pages` |
| `npm run build:pages` | Route HTML injection plus `vite-plugin-sitemap` crawl files |
| `npm run a11y:ci` | Lighthouse accessibility **and SEO** (min 0.9 each) + pa11y |

`a11y:ci` is named for historical reasons; it also asserts the Lighthouse SEO
category locally. It is not part of PR baseline CI due to runtime cost.

PR baseline CI runs `build:pages` and `test:crawl-files` only when site/build
paths change. Local SEO validation still uses the full list above. Release and
deploy workflows keep Pages/crawl as the safety net.

### Manual verification

After `build:pages`, inspect `dist/about/index.html` (or another route) and
confirm meta tags are present without running JavaScript.

External tools (cache aggressively — use their debug/refresh actions):

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Google Search Console](https://search.google.com/search-console)

## Related docs

- [accessibility.md](accessibility.md) — authoritative page requirements
- [deployment.md](deployment.md) — GitHub Pages publish flow
- [testing.md](testing.md) — test conventions and coverage map
