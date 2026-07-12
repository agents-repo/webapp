# Styling and Technology Decisions

## Stack

The webapp is a Vite + React + TypeScript frontend. It uses Bootstrap and
React Bootstrap for UI primitives, Font Awesome React for iconography, React
Router for page navigation, Sass for authored styles, ESLint (including
SonarJS rules, selected security checks, and type-aware TypeScript analysis)
for code linting, and markdownlint for documentation checks. Runtime
installability and offline support are provided through `vite-plugin-pwa`, and
registry catalog cache semantics are implemented with a lightweight in-memory
LRU policy plus persistent browser storage.

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

- Serve directly from cache when within 24h TTL — no network request.
- After TTL expires, send a conditional GET using `If-None-Match` (ETag) and/or
  `If-Modified-Since` headers stored from the previous response.
- A `304 Not Modified` response resets the TTL with zero body downloaded.
- A `200` response stores the new payload and the updated `ETag`/`Last-Modified`
  headers for future conditional requests.
- If the request fails, serve stale cache before showing an error state.
- Servers that do not send `ETag` or `Last-Modified` fall back silently to a
  full unconditional GET.

Service worker runtime caching is intentionally focused to same-origin static
assets. Registry index freshness is owned by the app-layer cache contract, and
broad interception of GET requests is intentionally avoided to reduce stale-data
risk.

The app currently uses Font Awesome React components for navigation and status
icons instead of introducing a separate in-house icon system.

The UI now supports Bootstrap 5.3 color modes through a header dropdown that
lets users choose light, dark, or auto. The selected mode is persisted.

Header chrome is intentionally fixed to a dark surface for consistency, while
page content surfaces (including cards) follow the selected color mode.

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

`RouteLoadingFallback` provides a `role="status"` loading message while async route
chunks fetch. A persistent `main#main-content` in `src/App.tsx` wraps routed
content so focus management and the skip link stay stable during lazy loads.
`RouteDocumentTitle` updates the browser tab title on pathname change before
lazy chunks resolve. The service worker caches same-origin
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
