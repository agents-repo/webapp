---
marp: true
theme: agents-repo
paginate: true
---

<!-- markdownlint-disable-file MD025 -->

<!-- _class: title -->

# Webapp infrastructure

Browse, search, and download the registry

agents-repo.org

---

# Purpose

Vite + React + TypeScript UI for the agents-repo catalog.

Users browse packages, read docs, and download artifacts. The site is **not**
the registry source of truth — that is `agents-repo/registry`.

---

# Stack (summary)

- React 19, Vite, TypeScript
- Bootstrap 5.3 + SCSS (`src/styles/bootstrap-theme.scss`)
- React Router, PWA (`vite-plugin-pwa`)
- Catalog cache: in-memory LRU + persistent browser storage

Details: `docs/styling-and-technology.md`.

---

# Styling policy

- App styles in **SCSS only** (no new app `.css` files)
- Theme tokens in `bootstrap-theme.scss`
- Shell: `src/index.scss`, `src/App.scss`

Do not change the stack without updating the decision docs in the same PR.

---

# Catalog fetch

Production default: **registry-proxy** (cached GitHub access).

Index: `packages/index.json`
Package pages: `packages/<namespace>/<id>/detail.json`

GitHub tree links may still point at the registry repo for browsing.

---

# Env overrides

`VITE_*` settings select registry base URL, GitHub repo URL, and site origin.

Local and preview can point at GitHub or another base. Production uses the
proxy `?ref=v2.x` line unless overridden.

See `docs/deployment.md` and README **Registry Source Configuration**.

---

# `build:pages`

`npm run build:pages` produces the GitHub Pages `dist/`:

- SPA `404.html` copy of `index.html`
- `.nojekyll`

Then `test:crawl-files` checks sitemap/robots against the production origin.

---

# Site vs Pages target

- **agents-repo.org** — custom domain users should use
- **agents-repo.github.io** — automated Pages deploy target, not a dev repo

Develop in **webapp**. Never treat `.github.io` as the source of changes.

---

# Deploy vs release

- **Deploy Webapp:** path-filtered push to `main` → lint, test, `build:pages`,
  publish `dist/`
- **Release:** `semantic-release` tags; does **not** deploy Pages

Docs-only merges do not redeploy. Agents must not merge to `main`.

---

# Cache and PWA (high level)

- Catalog index: 24h app TTL + conditional GET (`ETag` / `Last-Modified`)
- Service worker caches same-origin static assets
- Chat JSON/markdown: IndexedDB LRU (version-pinned URLs skip short TTL)

Privacy/SEO: `docs/privacy.md`, `docs/seo.md`. Not an a11y deep dive here.

---

# Contributor validation

Typical PR baseline (see CONTRIBUTING):

- `env:check`, `lint:all`, `test`, `typecheck`
- `build:pages`, `test:crawl-files`
- UI/a11y: `test:a11y` (local; not always in PR CI)

Plus `slides:check` when you touch this deck.

---

# Out of scope for this deck

- Click-through UI tour
- Accessibility deep dive (`docs/accessibility.md`)
- A presentations hub on agents-repo.org (future)

---

# Links

- `docs/styling-and-technology.md`
- `docs/deployment.md`
- `docs/development.md`
- Org ecosystem PDF in `.github` `docs/slides/`

---

<!-- _class: closing -->

# Next

Read `docs/deployment.md`, then `docs/development.md` for local setup.
