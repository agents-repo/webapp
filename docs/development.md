# Development Workflow

## Required Workflow

Before local implementation, follow `.github/CONTRIBUTING.md` **Required
Workflow**:

1. Open a tracking issue from `.github/ISSUE_TEMPLATE/` (except security
   vulnerabilities — see **Workflow exceptions** in `.github/CONTRIBUTING.md`).
2. Create a branch named `<prefix>/<issue-number>-<slug>` from latest `main`.
3. Push a scaffolding commit if needed, then open a draft pull request before
   implementation commits (`gh pr create --draft`). In `## Related Issues`,
   include `Closes #<issue-number>` for standard tasks, or follow the
   security-advisory format defined in the **Workflow exceptions** section of
   `.github/CONTRIBUTING.md` when applicable.
4. After validation passes, the developer manually marks the pull request ready
   for review. Agents MUST NOT mark pull requests ready for review.

See the organization [Required Workflow][org-rw] for shared norms.

## Toolchain

This project follows the pinned runtime declared in `.nvmrc` and `package.json`.
Use Corepack when possible so local npm matches CI.

```bash
corepack enable npm
corepack prepare npm@12.0.1 --activate
npm install
```

### Install script approvals (npm 12)

npm 12 requires explicit approval for dependency install scripts. Approved
packages are listed in `package.json` `allowScripts`. CI verifies no unreviewed
scripts remain after `npm ci`.

When a dependency introduces install scripts:

```bash
npm install-scripts ls
npm install-scripts approve <name>@<version>
```

Commit the resulting `allowScripts` update with your dependency change.

## Local Validation

Run these checks before agent handoff and before a human marks the pull request
ready for review (agents: see the organization's
[Pre-ready agent handoff](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pre-ready-agent-handoff)):

```bash
npm run env:check
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run test:crawl-files
```

For UI or accessibility changes, also run `npm run test:a11y` and `npm run a11y:ci`
after `build:pages`. For routing, registry integration, or modal flows, also run
`npm run test:e2e` locally (requires `npx playwright install chromium` once per
machine). E2E is not part of PR baseline CI — see [e2e-testing.md](e2e-testing.md).

Use `npm run build` for a standard production build (includes `sitemap.xml` and
`robots.txt` via `vite-plugin-sitemap`). Use `npm run build:pages` when
validating the GitHub Pages output (adds per-route HTML injection, `.nojekyll`,
and `404.html`).

Accessibility expectations and validation details are documented in
[accessibility.md](accessibility.md).

Unit test conventions, coverage map, and the coverage backlog are documented in
[testing.md](testing.md). Playwright E2E conventions are in [e2e-testing.md](e2e-testing.md).

Deployment and release details are documented in [deployment.md](deployment.md).

Pre-commit hooks run `npm run lint:all` automatically through Husky.

`lint:all` includes `lint:workflows` ([actionlint](https://github.com/rhysd/actionlint)
on `.github/workflows/`). Run `npm run lint:workflows` before pushing workflow
changes. See the organization
[GitHub Actions workflow linting](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md)
norm. When bumping `ACTIONLINT_VERSION` in `scripts/lint-workflows.mjs`, replace
`scripts/actionlint_<version>_checksums.txt` with the matching file from the
[actionlint GitHub release](https://github.com/rhysd/actionlint/releases) and
remove the previous version's checksums file. Keep the same pin across
organization repositories.

## SonarQube Cloud

Automatic Analysis reads [`.sonarcloud.properties`](../.sonarcloud.properties)
on each push to the default branch or a pull request branch.

`sonar.sources` and `sonar.tests` must be disjoint directory lists (no
wildcards). `sonar.sources` is `src,public,scripts,docs` — not `.` — so the
Playwright tree (`e2e/`) and repo tooling tests (`test/`) are not nested under
sources. Co-located Vitest files under `src/` stay source. Do not add `e2e` or
`test` back under `sonar.sources`; Automatic Analysis fails with “Source and
test paths overlap”.

`sonar.exclusions` also covers SVG and source-map assets (`**/*.svg`,
`**/*.map`), including `public/favicon.svg`, `public/icons.svg`, and
`src/assets/logo/agents-repo-logo.svg`. `sonar.cpd.exclusions` covers
`src/test/` helpers, `src/test/fixtures/` catalog mocks, co-located
`*.test.ts` / `*.test.tsx` files, and the bilingual privacy policy content
files so duplicated production-shaped fixture data, repeated test setup, and
intentional parallel translations do not inflate copy-paste findings.
Co-located tests remain in `sonar.sources` for issue detection.

Coverage report paths (`sonar.javascript.lcov.reportPaths`) and other external
analyzer reports are unsupported under Automatic Analysis. Do not add them
while Automatic Analysis is on.

## Project Layout

- `src/` contains the React application
- `public/` contains static assets served directly by Vite
- `docs/` contains contributor-facing documentation
- `docs/testing.md` documents unit test conventions and the coverage backlog
- `docs/architecture/` contains architecture decision records, including the DDD boundary note
- `.github/` contains AI guidance, issue templates, and workflows
- `.vscode/` contains recommended workspace defaults

## GitHub repository Website field

Each agents-repo GitHub repository can use a stable page on agents-repo.org as
its **Website** URL. Slugs under `/repositories/` are **immutable** once
published — do not rename them; external links and GitHub Website fields depend
on these paths.

| GitHub repository | Canonical Website URL |
| --- | --- |
| `agents-repo/registry` | `https://agents-repo.org/repositories/registry` |
| `agents-repo/webapp` | `https://agents-repo.org/repositories/webapp` |
| `agents-repo/cli` | `https://agents-repo.org/repositories/cli` |
| `agents-repo/registry-proxy` | `https://agents-repo.org/repositories/registry-proxy` |
| `agents-repo/.github` | `https://agents-repo.org/repositories/github` |
| `agents-repo.github.io` (Pages deploy) | `https://agents-repo.org/repositories/github-pages` |

Manifest data lives in
`src/modules/site/application/repositories/repositoryManifest.ts`. Unknown
`/repositories/:slug` paths redirect client-side to `/repositories`.

## Site docs (`/docs`)

Public site docs are markdown files in `src/content/docs/` with YAML frontmatter
(`title`, `description`, `order`, `section`). At build time:

- Vite bundles content through `src/modules/site/application/docs/docsManifest.ts`
- `scripts/copy-doc-markdown.mjs` copies each file to `dist/docs/<slug>.md` and
  writes `dist/llms.txt` with absolute URLs

Add or edit a doc page by creating `src/content/docs/<slug>.md` and ensuring the
slug is unique. Cross-link other site docs with paths like `/docs/installing-packages`.
The in-app doc search indexes each page's title, description, and body text from
the same manifest as the sidebar. Run `npm run lint:md` on new content.

When CLI commands, install targets, or registry submission workflows change in
upstream repos, manually update the affected doc pages (especially
`cli-commands`, `install-targets`, `cli-doctor`, and `submitting-a-package`).
Compare with [agents-repo/cli `docs/npm-cli-parity.md`](https://github.com/agents-repo/cli/blob/main/docs/npm-cli-parity.md)
on CLI releases.

## Styling

- App styling is authored in SCSS only.
- `src/styles/bootstrap-theme.scss` is the canonical Bootstrap customization entrypoint.
- `src/index.scss` and `src/App.scss` hold the base app styles.
- Do not add new `.css` entrypoints for application styling.
- Prefer global, reusable Bootstrap Sass variables and theme tokens before
  introducing custom classes.
- Use custom classes only when the requirement cannot be represented with
  Bootstrap variables, shared utilities, or component-level props.

## Current UI State

- The landing page and `/packages` indexes load registry package cards from a
  configured index source URL and show an error alert if no catalog data can be
  loaded. `/packages` is the crawlable all-packages index (distinct heading from
  Home) with URL-backed search and filters. `/packages/:namespace` is the same
  search and filters, scoped to that namespace.
  `/packages/:namespace/:packageId` is the latest-only package detail page.
- Package card footer actions (CLI, Use in chat, Download, View) include short
  visible labels. **View** and the card title open the in-app package page.
  **View on GitHub** is on the detail page. Below Bootstrap `md` the labels stay visible and the footer
  may wrap. From `md` up the footer stays on one row (`flex-md-nowrap`) and
  labels stay collapsed at rest (icon-first), then expand on that control's
  hover, keyboard focus (`:focus-visible`), or while `aria-expanded` is true.
  Large tablets in the 2-column layout do not get hover; labels then appear on
  focus or after tap. jsdom tests assert the label text and footer wrap classes
  in the DOM, not the `md+` collapse.
- Search is client-side only. On `lg+`, it transitions from hero to sticky
   header on scroll; below `lg`, hero search stays visible because sticky header
   search is hidden.
- The header includes an icon-only Bootstrap-style color mode dropdown alongside
   page links on desktop, with light, dark, and auto choices shown in menu
   items. Auto follows system color preference and the selected value persists
   across reloads.
- The header includes an install-app control (download icon). Chromium browsers
   show **Install app** when `beforeinstallprompt` fires and may also show their
   address-bar install icon (the app does not call `preventDefault`). If the
   in-app `prompt()` call fails, the header control stays so the user can retry.
   Browsers without that event show **How to install this site**, which opens a
   short modal with platform steps and a link to Using the catalog. The control
   is hidden when the app is already installed, while Chromium is still waiting
   for install criteria, or in local `dev` without a production service worker.
- The header now includes a settings cog control next to color mode. It opens a
   website settings modal with two independent registry URL overrides:
  - **Registry base URL override** for catalog fetching (GitHub URLs
    auto-normalized to raw content, raw URLs and other base URLs used as-is).
  - **GitHub repository URL** for **View on GitHub** on package detail pages.
    GitHub-only; does not affect catalog fetching.
   Both overrides persist in localStorage and take precedence over build-time
   configuration. Reset to default clears both overrides.
- Major-version line refs (`1.x`, `v1.x`) in either override resolve to the
   latest stable registry release tag. Tag lists are fetched from registry-proxy
   `GET /tags` when the fetch source is a proxy URL, or from the GitHub tags API
   as a fallback for GitHub-only source URLs. When the default proxy fetch
   source is configured, browse `v2.x` aliases use the same proxy `/tags` listing
   as catalog fetch (not per-browser GitHub API calls). Tag lists are cached for
   1 hour in IndexedDB (`tags` store, database `agents-repo-webapp-registry`)
   keyed by repository identity (`owner/repo`). Alias re-resolution runs
   when the 24h catalog cache has expired, website settings change, the user
   chooses **Clear cache and reload catalog** in website settings, or a package
   index/detail URL is missing from the loaded catalog (one forced reload per
   session) — not on every route navigation. Resolution uses the `semver`
   package.
- The registry catalog loads once at app level via
   `RegistryCatalogProvider` (`presentation/catalog/`) and is reused when
   returning to catalog pages; settings changes trigger a forced reload that
   bypasses warm in-memory catalog cache and tag cache and also clears the
   package `detail.json` IndexedDB LRU. A `/packages/:namespace` or
   `/packages/:namespace/:packageId` path that is missing from the loaded
   catalog triggers the same forced catalog reload at most once per session
   (it does not clear detail or tag stores). Extra-segment `/packages/*`
   paths stay on not-found without that reload.
- The shared header uses a mobile-first navbar: below `lg` navigation is
   collapsed behind a hamburger toggle.
- Header text destinations at `lg+` are Packages, Docs, About (dropdown), and
   Help Us, then the icon cluster (install, website settings, color mode). The
   brand wordmark is the Home link; it does not use selected-nav styling or
   `aria-current` (same pattern as GitHub / npm / MDN / React.dev). About,
   Community, and Contact are grouped under the About dropdown on large
   viewports and listed as flat links in the collapsed navbar. Repositories and
   legal pages stay in the footer.
- Header chrome remains intentionally dark across all modes, while page
   content (including cards) follows the selected color mode. Current-page
   header links use the dark-mode link/emphasis tint, not untinted `$primary`.
- Sticky header search is hidden below `lg`; from `lg` upward it appears in the
   middle region while brand stays left and page links stay right.
- Registry source configuration can be customized with Vite env vars:
   `VITE_REGISTRY_REPOSITORY_URL`, `VITE_REGISTRY_BASE_URL`,
   `VITE_REGISTRY_INDEX_PATH`, and `VITE_REGISTRY_GITHUB_REPOSITORY_URL`.
- Optional `VITE_SITE_URL` sets the canonical and Open Graph origin for SEO
   metadata during local `build:pages` previews (default:
   `https://agents-repo.org`). See [seo.md](seo.md).
- Optional `VITE_GTM_ID` sets the Google Tag Manager container ID for
   production analytics (default `GTM-57FJBZ7P` in `.env.production`). GTM
   loads only when `MODE === 'production'` **and** the user accepts analytics
   cookies — not in `npm run dev` or e2e builds (`MODE=e2e`). An invalid
   explicit `VITE_GTM_ID` disables analytics loading (no fallback container).
   See [privacy.md](privacy.md) and [seo.md](seo.md).
- Registry source URLs may be GitHub repository URLs, raw URLs, or other base
   URLs, but the resolved source must still provide the expected registry
   structure and a valid index payload at `VITE_REGISTRY_INDEX_PATH`
   (default `packages/index.json`).
- Default configured source is
   `https://registry.agents-repo.org?ref=v2.x`, which composes to
   `https://registry.agents-repo.org/packages/index.json?ref=v2.x`
   before major-version alias resolution. At catalog load time, `v2.x` resolves
   to the latest stable v2 release tag (for example `v2.0.0`).
- Package artifact URLs use namespaced paths:
   `packages/<namespace>/<package-id>/versions/<version>/<version>-<target>.zip`.
- Website settings modal shows catalog source status details, including updated
   date, package count, source URL, and cache/failure tag.
- Registry catalog loading uses a 24h app-owned cache policy with conditional
   GET revalidation. While the catalog cache is still fresh, tag resolution and
   catalog network requests are skipped; resolved refs are inferred from the
   cached index URL. After the TTL expires the app re-resolves aliases, then
   sends `If-None-Match` and/or `If-Modified-Since` request headers. A `304 Not
   Modified` response resets the TTL with zero body downloaded; a `200` response
   stores the new payload and the updated `ETag`/`Last-Modified` headers.
   Service worker HTML navigations use NetworkFirst (1-day offline fallback).
   Same-origin static assets use a 7-day runtime cache. HTTP `Cache-Control`
   stays GitHub Pages defaults (typically `max-age=600`).
   Use in chat loads versioned `/pkg/` `instructions.json` and instruction
   markdown through the IndexedDB LRU (manifest max 64, markdown max 128).
   Version-pinned URLs skip the short TTL; latest/short-alias URLs use a 24h
   TTL. Repeat opens of the same cached URL skip the network. Failed loads are
   not cached. ZIP artifacts are not stored in IndexedDB.
- The styling and architecture decisions are documented in
   `docs/styling-and-technology.md` and `docs/architecture/ddd-decision.md`.

## Cache and PWA Validation

After changing cache or service worker behavior, validate locally with:

1. Start the app with `npm run dev`.
2. Open browser devtools and inspect Application > Storage and Service Workers.
3. Confirm first online load populates catalog and cache entries. Inspect
   Application > IndexedDB > `agents-repo-webapp-registry` (stores `catalog`,
   `package-detail`, `tags`, `chat-manifest`, `chat-markdown`) and confirm catalog
   envelopes contain `etag` or `lastModified` fields when the server returned
   those headers. Preferences (`theme`, `analytics-consent`, registry URL
   overrides) remain in Application > Local Storage.
4. Reload and confirm catalog can be served from app cache within 24h (no
   network request visible in the Network tab).
5. Force-expire the cache by editing `cachedAt` to `0` in the stored envelope
   (Application > IndexedDB > `agents-repo-webapp-registry` > `catalog`), then
   reload. Confirm the outgoing request
   carries `If-None-Match` and/or `If-Modified-Since` headers. If the server
   returns `304`, no response body should appear; `cachedAt` should be updated
   in storage. If the server returns `200`, the new payload and headers should
   be stored.
6. Simulate network failure for the index request and confirm stale cached
   catalog is used when available.
7. Simulate network failure with no cached catalog and confirm an error alert is
   shown.
8. For production service worker behavior, run `npm run build:pages && npm run
   preview` (Vite `dev` does not register the production worker). Verify the
   worker is active, Cache Storage includes `html-pages-cache` and
   `app-static-runtime-cache`, and a second load of `/` goes to the network (or
   GitHub Pages HTTP revalidation), not the precached SPA shell.
9. Open `/sitemap.xml` and `/robots.txt` in the same tab after the worker is
   active and confirm XML/text, not a redirect to the home SPA.

## PWA Install Validation

Validate install discoverability with a production build:

1. Run `npm run build:pages && npm run preview`.
2. Open the preview URL in a fresh Chromium profile or after clearing site data.
3. Confirm the browser can show its address-bar install icon, and that the
   header shows **Install app** once install criteria are met.
4. Click the header control and complete the browser install prompt.
5. Confirm the control disappears after install, or when reopening the app in
   standalone mode.
6. In Firefox desktop, confirm the header shows **How to install this site**,
   the modal explains that Firefox cannot install from the manifest, and the
   learn-more link opens Using the catalog. There is no native PWA install.

## Cache and Service Worker Reset

When debugging stale behavior, clear both layers before retesting:

1. In devtools Application tab, clear local storage for the app origin.
2. Clear Cache Storage entries for runtime caches.
3. Unregister the active service worker.
4. Hard reload the page.

## Pull Requests

Use the pull request template in `.github/pull_request_template.md`.
Keep changes scoped and document any UI or workflow impact clearly.

Checklist when opening the draft PR and before requesting review:

1. Complete the Required Workflow steps above (issue, branch, push, draft PR).
2. Choose the matching category: bug/inconsistency, spec change, feature
   proposal, or task/chore.
3. Documentation-only work uses the task/chore issue category and the `docs/`
   branch prefix.
4. Use the prefix that matches the work category:

   - `fix/` for bug or inconsistency
   - `spec/` for spec change
   - `feat/` for feature proposal
   - `chore/` for task or chore
   - `docs/` for documentation-only work

5. In `## Related Issues`, include a tracking reference: `Closes #<issue-number>`
   for standard tasks, or the security-advisory format defined in the
   **Workflow exceptions** section of `.github/CONTRIBUTING.md` when applicable.
6. Every PR targeting `main` MUST include a tracking reference.

Canonical cross-repo mapping:
[organization branch prefix reference](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#branch-prefix-reference).

[org-rw]: https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow
