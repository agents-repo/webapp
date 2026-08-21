# Styling and Technology Decisions

## Stack

The webapp is a Vite + React + TypeScript frontend. It uses Bootstrap and
React Bootstrap for UI primitives, Font Awesome React for iconography, React
Router for page navigation, Sass for authored styles, ESLint (including
SonarJS rules, selected security checks, and type-aware TypeScript analysis)
for code linting, and markdownlint for documentation checks. Package README
and agent/flow accordion markdown parse YAML frontmatter with the `yaml`
package (YAML 1.2) and render the body with `react-markdown` plus
`remark-gfm`. Site docs still split frontmatter without a YAML parser. Runtime
installability and offline support are provided through `vite-plugin-pwa`, and
registry JSON/markdown cache semantics are implemented with a lightweight
in-memory LRU plus IndexedDB persistence via the `idb` package. Catalog index,
package `detail.json`, repository tags, chat `instructions.json`, and chat
`.agent.md` share that persistent LRU helper in registry infrastructure.
ZIP artifacts are not cached. Preferences (`theme`, analytics consent, registry
URL overrides, `catalog.filters.sidebarCollapsed`) stay in localStorage.

## Styling Policy

- Authored application styles must use SCSS.
- Do not introduce new `.css` files for app behavior or layout.
- `src/styles/bootstrap-theme.scss` is the canonical Bootstrap customization entrypoint.
- `src/index.scss` owns base document-level styles.
- `src/App.scss` owns app-shell and shared page chrome styles.
- Prefer global, reusable Bootstrap Sass variables and theme tokens before
  creating custom classes.
- Use custom classes only when the requirement cannot be expressed through
  Bootstrap variables, shared utilities, or component props.
- When a Bootstrap token exists, define it in
  `src/styles/bootstrap-theme.scss` instead of adding one-off style overrides
  in page or shell styles.

## Current State

The current UI loads registry index data from a source URL configured at build
time (Vite `VITE_...` env vars). If remote loading fails, the UI uses cached
catalog data when available and otherwise shows an error state.

Registry index loading follows an app-owned 24h freshness policy with
conditional GET revalidation to minimize network usage:

- Serve directly from cache when within 24h TTL — no network request, except
  when a package index or detail URL is missing from that cached catalog. In
  that case the app re-resolves the major-version alias (for example `v2.x`)
  and reloads `packages/index.json` once, then shows the package or
  **Package not found**.
- After TTL expires, send a conditional GET using `If-None-Match` (ETag) and/or
  `If-Modified-Since` headers stored from the previous response.
- A `304 Not Modified` response resets the TTL with zero body downloaded.
- A `200` response stores the new payload and the updated `ETag`/`Last-Modified`
  headers for future conditional requests.
- If the request fails, serve stale cache before showing an error state.
- Servers that do not send `ETag` or `Last-Modified` fall back silently to a
  full unconditional GET.

Versioned chat instruction bodies (`instructions.json` and `.agent.md` under
`/pkg/` paths) persist in IndexedDB with the same app-owned cache helper.
Version-pinned URLs (`/versions/<semver>/` or `/pkg/<ns>/<pkg>/<semver>/`) skip
the short TTL; latest/short-alias URLs use a 24h TTL. Package-page expand
markdown uses the same chat markdown store when loaded through the chat
instruction fetchers. Network `fetch` omits `cache: 'no-store'` so browsers can
honor registry-proxy `Cache-Control: public, max-age=300` for catalog,
`detail.json`, and markdown. Catalog index and package `detail.json` share a 24h
IndexedDB LRU helper in registry infrastructure. Tag lists use a 1h TTL keyed by
repository identity. **Clear cache and reload catalog** clears those IndexedDB
stores; it does not bust the HTTP 300s cache.

Service worker caching is split on purpose:

- HTML document navigations use `NetworkFirst` (`html-pages-cache`, 1-day
  expiration) so repeat visits load current HTML when online. GitHub Pages HTTP
  `Cache-Control` (typically `max-age=600`) still applies to those network
  fetches. The webapp does not set or overlay HTTP cache headers.
- Hashed JS/CSS/images stay in the Workbox precache (filename cache-busting).
  Extra same-origin static assets, including mermaid, use runtime
  `StaleWhileRevalidate` (7 days).
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/docs/*.md` are excluded from
  the HTML NetworkFirst matcher so crawl files are never replaced by the SPA
  shell. `navigateFallback` is disabled because generateSW would register it
  before runtime routes and freeze HTML again.

Registry index freshness is owned by the app-layer cache contract. Broad
interception of GET requests is still avoided for registry JSON.

The app currently uses Font Awesome React components for navigation and status
icons instead of introducing a separate in-house icon system.

The UI now supports Bootstrap 5.3 color modes through a header dropdown that
lets users choose light, dark, or auto. The selected mode is persisted.

Header chrome is intentionally fixed to a dark surface for consistency, while
page content surfaces (including cards) follow the selected color mode.
Dark-mode links, outline buttons, and the always-dark header current-page item
use a 70% tint of `$primary` (`$link-color-dark` / `$primary-text-emphasis-dark`
in `src/styles/bootstrap-theme.scss`) so purple-on-dark text meets WCAG 2.2 AA.
Filled `$primary` buttons and badges stay `#8a2ad8`. Bootstrap does not retint
`.btn-outline-*` for dark mode; those resting color and border tokens are
overridden under `[data-bs-theme="dark"]`.

Package README and accordion markdown (`PackageMarkdown`) render a closed YAML
frontmatter mapping as nested HTML tables (two-column key/value tables;
arrays of objects as header rows; arrays of primitives as a single-column
table with a `Value` column header). The remaining body is GitHub Flavored Markdown. Unclosed or invalid
YAML, and non-mapping roots, stay ordinary markdown. Cyclic YAML aliases and
nodes nested deeper than 32 mappings or arrays are omitted from the table so
rendering cannot overflow the call stack. Table cell borders and
padding are shared with `.docs-markdown` in `src/App.scss`. Site docs still
strip YAML frontmatter instead of showing it as a table. The `yaml` parser is
a static import on the lazy `PackageDetailPage` chunk (about 119 kB minified
with package markdown, 38 kB gzip). That stays under the 500 kB warning used
for `vendor-react` / `vendor-ui` / the initial bundle, so `yaml` is not
lazy-imported on its own.

## Code splitting

Production bundles use two complementary strategies to keep individual JavaScript
chunks below Vite's 500 kB warning threshold:

- **Route-level lazy loading** — the home route (`/`) stays in the initial
  bundle because it is the primary entry path. Secondary routes (`/about`,
  `/contact`, `/help-us`, `/accessibility`, `/privacy`, `/privacidade`) load
  on demand via `React.lazy` and `Suspense` in `src/App.tsx`.
- **Vendor chunk groups** — `vite.config.ts` uses Rolldown
  `build.rolldownOptions.output.codeSplitting` to split React and UI library
  dependencies into separate hashed chunks (`vendor-react`, `vendor-ui`).
  Package README mermaid diagrams load `mermaid` on demand (`vendor-mermaid`)
  so pages without `language-mermaid` fences do not pay that cost. Site docs
  (`DocMarkdown`) do not load this chunk. `vendor-mermaid` is larger than Vite's
  500 kB warning and Workbox's 2 MiB precache limit; it is excluded from the
  service worker precache and fetched only when a mermaid fence renders.
  Runtime `StaleWhileRevalidate` still caches the hashed file after first use.
  The initial bundle, `vendor-react`, and `vendor-ui` stay under 500 kB.

`RouteLoadingFallback` provides a `role="status"` loading message while async route
chunks fetch and marks the app-shell `main` with `aria-busy` during loading.
`RouteAnnouncer` defers navigation announcements until route content is ready. A
persistent `main#main-content` in `src/App.tsx` wraps routed content so focus
management and the skip link stay stable during lazy loads. `RouteDocumentTitle`
updates the browser tab title on pathname change before lazy chunks resolve.
`LazyRouteErrorBoundary` shows a recoverable fallback when a lazy chunk fails to
load. The service worker caches same-origin
script assets with `StaleWhileRevalidate`; additional hashed chunks are expected
and remain within the configured runtime cache entry limit.

## Analytics and third-party scripts

The approved stack for optional production analytics:

- **Google Consent Mode v2** — default-deny stub in `index.html` (all environments)
- **Google Tag Manager** — runtime injection after explicit consent (`MODE === 'production'` only)
- **Cookie consent banner** — `CookieConsentBanner` + `CookieConsentProvider`;
  styles in `App.scss` (`.cookie-consent-banner`)

GTM is not added via a Vite HTML transform or static snippet. SPA pageviews use
React `dataLayer` pushes (`AnalyticsRouteTracker`), not full page reloads. See
[privacy.md](privacy.md) and [seo.md](seo.md).

## Why This Split Exists

This split keeps Bootstrap customization centralized and makes the right
styling surface easier to find. It also keeps app shell styling separate from
Bootstrap variables, which reduces the risk of regressions when theme tokens
change.

## Related Docs

- [Development workflow](development.md)
- [AI collaboration guidance](ai-collaboration.md)
- [Architecture and DDD decision](architecture/ddd-decision.md)
