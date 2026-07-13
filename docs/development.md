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

Run these checks before marking the pull request ready for review:

```bash
npm run env:check
npm run lint:all
npm run test
npm run test:a11y
npm run typecheck
npm run build:pages
```

For UI or accessibility changes, also run `npm run test:a11y` and `npm run a11y:ci`
after `build:pages`. For routing, registry integration, or modal flows, also run
`npm run test:e2e` locally (requires `npx playwright install chromium` once per
machine). E2E is not part of PR baseline CI — see [e2e-testing.md](e2e-testing.md).

Use `npm run build` for a standard production build. Use `npm run build:pages`
when validating the GitHub Pages output (adds `.nojekyll` and `404.html`).

Accessibility expectations and validation details are documented in
[accessibility.md](accessibility.md).

Unit test conventions, coverage map, and the coverage backlog are documented in
[testing.md](testing.md). Playwright E2E conventions are in [e2e-testing.md](e2e-testing.md).

Deployment and release details are documented in [deployment.md](deployment.md).

Pre-commit hooks run `npm run lint:all` automatically through Husky.

## Project Layout

- `src/` contains the React application
- `public/` contains static assets served directly by Vite
- `docs/` contains contributor-facing documentation
- `docs/testing.md` documents unit test conventions and the coverage backlog
- `docs/architecture/` contains architecture decision records, including the DDD boundary note
- `.github/` contains AI guidance, issue templates, and workflows
- `.vscode/` contains recommended workspace defaults

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

- The landing page loads registry package cards from a configured index source
   URL and shows an error alert if no catalog data can be loaded.
- Search is client-side only. On `lg+`, it transitions from hero to sticky
   header on scroll; below `lg`, hero search stays visible because sticky header
   search is hidden.
- The header includes an icon-only Bootstrap-style color mode dropdown alongside
   page links on desktop, with light, dark, and auto choices shown in menu
   items. Auto follows system color preference and the selected value persists
   across reloads.
- The header includes an install-app control (download icon) when the browser
   exposes a deferred PWA install prompt. The button is hidden when the app is
   already installed or install is unavailable (for example in local dev without
   a production service worker).
- The header now includes a settings cog control next to color mode. It opens a
   website settings modal with two independent registry URL overrides:
  - **Registry base URL override** for catalog fetching (GitHub URLs
    auto-normalized to raw content, raw URLs and other base URLs used as-is).
  - **GitHub repository URL** for package browse links in package card footers.
    GitHub-only; does not affect catalog fetching.
   Both overrides persist in localStorage and take precedence over build-time
   configuration. Reset to default clears both overrides.
- Major-version line refs (`1.x`, `v1.x`) in either override resolve to the
   latest stable registry release tag. Tag lists are fetched from registry-proxy
   `GET /tags` when the fetch source is a proxy URL, or from the GitHub tags API
   as a fallback for GitHub-only source URLs. Tag lists are cached for 1 hour in a
   single localStorage entry (`registry.tags.cache.v1`) keyed by repository identity
   (`owner/repo`) inside the envelope. Alias re-resolution runs when the
   24h catalog cache has expired or website settings change — not on every route
   navigation. Resolution uses the `semver` package.
- The registry catalog loads once at app level via
   `RegistryCatalogProvider` (`presentation/catalog/`) and is reused when
   returning to the home page; settings changes trigger a forced reload that
   bypasses warm in-memory catalog cache and tag cache.
- The shared header uses a mobile-first navbar: below `lg` navigation is
   collapsed behind a hamburger toggle.
- Header chrome remains intentionally dark across all modes, while page
   content (including cards) follows the selected color mode.
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
   `https://registry-proxy.maiconfz.workers.dev?ref=v2.x`, which composes to
   `https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v2.x`
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
   Service worker runtime caching is focused to same-origin static assets only.
- The styling and architecture decisions are documented in
   `docs/styling-and-technology.md` and `docs/architecture/ddd-decision.md`.

## Cache and PWA Validation

After changing cache or service worker behavior, validate locally with:

1. Start the app with `npm run dev`.
2. Open browser devtools and inspect Application > Storage and Service Workers.
3. Confirm first online load populates catalog and cache entries. Inspect
   Application > Local Storage and confirm the stored envelope contains `etag`
   or `lastModified` fields when the server returned those headers.
4. Reload and confirm catalog can be served from app cache within 24h (no
   network request visible in the Network tab).
5. Force-expire the cache by editing `cachedAt` to `0` in the stored envelope
   (Application > Local Storage), then reload. Confirm the outgoing request
   carries `If-None-Match` and/or `If-Modified-Since` headers. If the server
   returns `304`, no response body should appear; `cachedAt` should be updated
   in storage. If the server returns `200`, the new payload and headers should
   be stored.
6. Simulate network failure for the index request and confirm stale cached
   catalog is used when available.
7. Simulate network failure with no cached catalog and confirm an error alert is
   shown.
8. Verify service worker is active and runtime caches include same-origin static
   assets.

## PWA Install Validation

Validate the in-app install control with a production build (Chromium-based
browsers):

1. Run `npm run build && npm run preview`.
2. Open the preview URL in a fresh profile or after clearing site data.
3. Confirm the header shows the install control (download icon) once install
   criteria are met.
4. Click the control and complete the browser install prompt.
5. Confirm the control disappears after install, or when reopening the app in
   standalone mode.

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

[org-rw]: https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow
