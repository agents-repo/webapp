# Development Workflow

## Toolchain

This project follows the pinned runtime declared in `.nvmrc` and `package.json`.
Use Corepack when possible so local npm matches CI.

```bash
corepack enable
corepack prepare npm@11.12.1 --activate
npm install
```

## Local Validation

Run these checks before opening a pull request:

```bash
npm run env:check
npm run lint:all
npm run typecheck
npm run build
```

Pre-commit hooks run `npm run lint:all` automatically through Husky.

## Project Layout

- `src/` contains the React application
- `public/` contains static assets served directly by Vite
- `docs/` contains contributor-facing documentation
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
- Search is client-side only. On `lg+`, it transitions from hero to sticky header
   on scroll; below `lg`, hero search stays visible because sticky header search
   is hidden.
- The header includes an icon-only Bootstrap-style color mode dropdown alongside
   page links on desktop, with light, dark, and auto choices shown in menu
   items. Auto follows system color preference and the selected value persists
   across reloads.
- The shared header uses a mobile-first navbar: below `lg` navigation is
  collapsed behind a hamburger toggle.
- Header chrome remains intentionally dark across all modes, while page content
  (including cards) follows the selected color mode.
- Sticky header search is hidden below `lg`; from `lg` upward it appears in
  the middle region while brand stays left and page links stay right.
- Registry source configuration can be customized with Vite env vars:
  `VITE_REGISTRY_REPOSITORY_URL`, `VITE_REGISTRY_BASE_URL`, and
  `VITE_REGISTRY_INDEX_PATH`.
- Registry catalog loading uses a 24h app-owned cache policy plus focused
  service worker runtime caching for static assets and the configured index
  URL.
- The styling and architecture decisions are documented in `docs/styling-and-technology.md`
  and `docs/architecture/ddd-decision.md`.

## Cache and PWA Validation

After changing cache or service worker behavior, validate locally with:

1. Start the app with `npm run dev`.
2. Open browser devtools and inspect Application > Storage and Service Workers.
3. Confirm first online load populates catalog and cache entries.
4. Reload and confirm catalog can be served from app cache within 24h.
5. Simulate network failure for the index request and confirm stale cached
   catalog is used when available.
6. Simulate network failure with no cached catalog and confirm an error alert is
   shown.
7. Verify service worker is active and runtime caches include static assets and
   the configured index URL.

## Cache and Service Worker Reset

When debugging stale behavior, clear both layers before retesting:

1. In devtools Application tab, clear local storage for the app origin.
2. Clear Cache Storage entries for runtime caches.
3. Unregister the active service worker.
4. Hard reload the page.

## Pull Requests

Use the pull request template in `.github/pull_request_template.md`.
Keep changes scoped and document any UI or workflow impact clearly.

Before opening a PR:

1. Create an issue from the matching form in `.github/ISSUE_TEMPLATE/`.
2. Choose the matching category: bug/inconsistency, spec change, feature
   proposal, or task/chore.
3. Documentation-only work uses the task/chore issue category and the `docs/`
   branch prefix.
4. Create a non-`main` branch from the latest `main` using
   `<prefix>/<issue-number>-<slug>`.
5. Use the prefix that matches the work category:

   - `fix/` for bug or inconsistency
   - `spec/` for spec change
   - `feat/` for feature proposal
   - `chore/` for task or chore
   - `docs/` for documentation-only work

6. In `## Related Issues`, include `Closes #<issue-number>`.
7. Every PR targeting `main` must close a tracking issue.
