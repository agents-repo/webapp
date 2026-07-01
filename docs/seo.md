# SEO

This document describes search-engine and social-preview expectations for the
Agents Repo webapp. **Accessibility requirements take precedence** — see
[accessibility.md](accessibility.md) for page titles, announcements, and UI
patterns. SEO work is additive and must not replace those mechanisms.

## Precedence

| Concern | Owner | SEO layer |
| --- | --- | --- |
| Page title | `useDocumentTitle` (WCAG 2.4.2) | Build `<title>` + OG mirror in `SiteHead` |
| Route labels | `sitePageMeta` | `siteSeoMeta` |
| Semantic HTML | Page components | Shared wins — do not regress |

## Architecture

Reusable SEO helpers live in `src/modules/site/application/seo/`:

| Module | Role |
| --- | --- |
| `siteSeoMeta.ts` | Per-route descriptions and canonical paths |
| `siteSeo.ts` | Site origin, OG image constants |
| `buildRouteHead.ts` | Single source for crawler and runtime SEO head tags |
| `SiteHead.tsx` | `react-helmet-async` updates for client-side route changes |

**Runtime (SPA navigation):** `SiteHead` updates meta tags when users move
between routes. It does **not** set `<title>`.

**Build (GitHub Pages):** `scripts/prepare-pages-dist.mjs` injects route-specific
head tags into `dist/**/index.html` and generates `dist/sitemap.xml`.

**Crawl files:** `public/robots.txt` is copied to `dist/`. The sitemap is
generated at build time from `siteRoutes`.

## Shared accessibility wins

These patterns already help SEO and must stay in place:

- `lang="en"` on `<html>`
- One `<h1>` per page and semantic `<main id="main-content">`
- Header and footer internal links to all public routes
- Skip link and route announcer (accessibility-first; no SEO-specific changes)

## Industry checklist

| Pattern | Implementation |
| --- | --- |
| Self-referential canonical (absolute URL) | `buildRouteHead()` → `<link rel="canonical">` |
| `og:url` matches canonical | Same builder function |
| Absolute `og:image` | `{siteOrigin}/og-image.png` (1200×630) |
| OG image dimensions and alt | `og:image:width`, `og:image:height`, `og:image:alt` |
| Twitter large image card | `twitter:card=summary_large_image` |
| Meta description (~150–160 chars) | `siteSeoMeta` per route |
| `robots.txt` allows crawl + sitemap | `public/robots.txt` |
| Sitemap with canonical URLs only | Generated in `prepare-pages-dist.mjs` |
| JSON-LD `WebSite` + `Organization` | Home route only |
| JSON-LD `WebPage` | All other public routes |

Do **not** block JavaScript or CSS in `robots.txt` — Google needs assets to
render pages.

## Per-route checklist

When adding a public route:

1. Add the path to `siteRoutes.ts`
2. Add accessibility metadata to `sitePageMeta.ts` (`title`, `routeLabel`)
3. Add SEO metadata to `siteSeoMeta.ts` (`description`, `canonicalPath`)
4. Call `useDocumentTitle(sitePageMeta[siteRoutes.<route>].title)` on the page
5. Run `npm run build:pages` and confirm the new route appears in `dist/sitemap.xml`
6. Run `npm run a11y:ci` locally to verify Lighthouse SEO on the new route

## SPA limitations

- The home catalog is loaded client-side. Build-time head injection improves
  titles and meta tags but does not index individual registry packages.
- There are no per-package URLs today.
- Social crawlers read the initial HTML. Client-only meta tags (without build
  injection) are insufficient for link previews.

## Environment

Optional build-time override for preview or staging canonical/OG URLs:

- `VITE_SITE_URL` — absolute origin without a trailing slash (for example
  `https://agents-repo.github.io`)

When unset, production defaults to `https://agents-repo.github.io`.

## Validation

Run before opening or updating a pull request that touches SEO:

```bash
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run a11y:ci
```

| Command | Purpose |
| --- | --- |
| `npm run test` | Unit tests for `buildRouteHead`, `siteSeoMeta`, and `SiteHead` |
| `npm run build:pages` | Route HTML injection and sitemap generation |
| `npm run a11y:ci` | Lighthouse accessibility **and SEO** (min 0.9 each) + pa11y |

`a11y:ci` is named for historical reasons; it also asserts the Lighthouse SEO
category locally. It is not part of PR baseline CI due to runtime cost.

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
