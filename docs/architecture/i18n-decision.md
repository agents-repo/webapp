# i18n architecture decision

## Status

Accepted (2026-03-06)

## Context

The webapp needed locale-aware URLs, shell translations, localized SEO/crawl
output, and a single privacy route model without maintaining duplicate pages
such as `/privacidade`.

## Decision

1. **URL prefixes** — English remains unprefixed; `es`, `pt-br`, and `pt-pt`
   prefix all site routes via `localizedSitePath()`.
2. **react-i18next** — JSON namespaces under `src/locales/` with
   `i18next-resources-to-backend` lazy loading and `useSuspense: true`.
3. **LocaleProvider** — Parses locale from the pathname, persists choice in
   `localStorage` (`locale` key), sets `document.documentElement.lang`, and
   optionally redirects first-time home visitors from browser language.
4. **Router stripping** — `App.tsx` passes a locale-stripped `location` to
   `Routes` so route constants stay locale-free.
5. **Single privacy page** — `PrivacyPage` selects locale content; legacy
   `/privacidade` 301-style client redirect to `/pt-br/privacy/`.
6. **Build expansion** — `getBuildSitemapPaths()` duplicates static/manifest
   routes per locale for sitemap and GitHub Pages HTML shells.
7. **Package catalog fallback** — Non-English locales may show a Google Translate
   link on catalog index, namespace list, and package detail pages for content not
   yet translated in-repo.

## Consequences

- New public copy should add keys to all locale JSON files (at minimum `en`).
- SEO helpers must strip locale prefixes before route matching.
- Tests wrap UI with `LocaleProvider` via `renderWithProviders`.

## Alternatives considered

- **Separate routes per language** (`/privacidade`) — rejected; harder SEO and
  duplicate maintenance.
- **Query-param locale** (`?lang=es`) — rejected; poor crawlability and sharing.
- **Subdomain locales** — rejected; deployment and cookie complexity.

## References

- [docs/i18n.md](../i18n.md)
- `src/modules/site/application/i18n/`
