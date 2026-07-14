# Deployment

The webapp is published to GitHub Pages at:

- <https://agents-repo.org/> (custom domain)
- <https://agents-repo.github.io/> (legacy; client redirect to custom domain after deploy)

Merges to `main` that change app source files trigger an automated build and
deploy of the static `dist/` output to `agents-repo/agents-repo.github.io`.
Site content changes belong in this repository; `agents-repo.github.io` is the
automated deployment target only.

Semantic versioning (GitHub Releases and `v*` tags) is handled separately by
the **Release** workflow and is not required for production deploys.

## How deployment works

1. A maintainer merges to `main` (agents must not perform this step).
2. When changed files match the **Deploy Webapp** path filter (see below), the
   workflow runs lint, typecheck, tests, `npm run build:pages`, and publishes
   `dist/` via `peaceiris/actions-gh-pages`.
3. The **Release** workflow runs validation and `semantic-release` on every
   `main` push. When commit history includes releasable changes, it creates a
   `v<MAJOR>.<MINOR>.<PATCH>` tag and GitHub Release only — it does not deploy.

Deploy and release are independent: a `chore:` commit that touches `src/` can
deploy without creating a new GitHub Release; a `feat:` merge can both deploy
and create a release in the same push.

### Deploy Webapp path filter

The **Deploy Webapp** workflow runs on `push` to `main` when any of these
paths change:

- `src/**`, `public/**`, `scripts/**`
- `index.html`, `vite.config.ts`, `tsconfig*.json`
- `package.json`, `package-lock.json`, `.env.production`

Docs-only or workflow-only merges do not trigger a redeploy. After merging
workflow changes without app-source edits, run **Deploy Webapp** manually once
to verify the deploy path (see [Manual deploy](#manual-deploy)).

### Concurrency

**Deploy Webapp** and **Pages Deploy** share the `pages-publish` concurrency
group so only one `peaceiris` push runs at a time. Push-triggered deploys use
`cancel-in-progress` so rapid merges deploy the latest SHA.

During an active **Pages Deploy** rollback, avoid merging to `main` until the
rollback completes — an incoming push deploy may cancel an in-flight rollback.

The `build:pages` script adds GitHub Pages SPA support:

- `404.html` copied from `index.html` for client-side routing
- `.nojekyll` to disable Jekyll processing

Automated semantic-release uses `GITHUB_TOKEN`, which does not trigger
`release: published` in separate workflows. **Pages Deploy** remains available
for tag-based rollback and for releases created outside the Release workflow.

## Required secret: `PAGES_DEPLOY_TOKEN`

Cross-repo deploy uses a Personal Access Token stored in the **webapp**
repository secrets.

### Create the token

Use a fine-grained PAT (recommended) or classic PAT with:

- **Repository access:** `agents-repo/agents-repo.github.io` only
- **Permissions:** Contents — Read and write

### Add the secret

1. Open `agents-repo/webapp` repository settings.
2. Go to **Secrets and variables** → **Actions**.
3. Add `PAGES_DEPLOY_TOKEN` with the PAT value.

Deploy workflows pass this secret to `peaceiris/actions-gh-pages@v4` as the
`personal_token` input (required for cross-repo pushes).

Deploy commits appear under the PAT owner's GitHub account, not
`github-actions[bot]`.

## First release sequencing

1. Merge the release-automation PR with squash title
   `feat: add semantic-release and GitHub Pages deploy` to trigger `v1.0.0`.
2. Configure `PAGES_DEPLOY_TOKEN` before or immediately after merge.
3. If Pages deploy fails because the secret was missing, redeploy manually (see
   below) — no new release is required.

## Manual deploy

| Goal | Workflow | Command |
| --- | --- | --- |
| Deploy current `main` HEAD | **Deploy Webapp** | See below |
| Redeploy or roll back to a `v*` tag | **Pages Deploy** | See below |

To deploy the current `main` branch (for example after a workflow-only merge):

```bash
gh workflow run deploy-webapp.yml --repo agents-repo/webapp
```

To redeploy an existing release tag without creating a new release:

1. Open **Actions** → **Pages Deploy** in `agents-repo/webapp`.
2. Run workflow with input `tag` set to an existing release (for example
   `v1.0.0`).

```bash
gh workflow run pages-deploy.yml --repo agents-repo/webapp -f tag=v1.0.0
```

## Production build configuration

Production builds use in-code registry defaults unless overridden with GitHub
Actions variables or build-time `VITE_*` environment variables:

- `VITE_REGISTRY_REPOSITORY_URL`
- `VITE_REGISTRY_BASE_URL`
- `VITE_REGISTRY_INDEX_PATH`
- `VITE_REGISTRY_GITHUB_REPOSITORY_URL`

No secrets are required for the default public Pages deployment.

Optional production analytics:

- `VITE_GTM_ID` — GTM container ID (default in `.env.production`)
- Consent Mode v2 default-deny is baked into `index.html` at build time
- The GTM script loads at **runtime** only after the user accepts analytics
  cookies (`MODE === 'production'`). Static `dist/index.html` must contain the
  consent stub but must **not** contain the GTM container snippet or ID.

See [privacy.md](privacy.md) and [seo.md](seo.md) for verification steps.

## Smoke checks after deploy

1. Open <https://agents-repo.org/>.
2. Verify deep links: `/about`, `/contact`, `/help-us`, `/privacy`, `/privacidade`.
3. Confirm the registry catalog loads (default proxy source).
4. Open <https://agents-repo.github.io/> and confirm the browser redirects to
   `https://agents-repo.org/` with the same path.
5. View page source on the custom domain and confirm canonical URLs use
   `https://agents-repo.org`.
6. Check <https://agents-repo.org/robots.txt> and `sitemap.xml` for
   `agents-repo.org` URLs. Open `sitemap.xml` in a normal browser tab (with the
   PWA service worker active) and confirm XML is shown, not a redirect to home.

## Rollback

Redeploy a prior `v*` tag using **Pages Deploy**. For example, to roll back from
`v1.1.0` to `v1.0.0`:

```bash
gh workflow run pages-deploy.yml --repo agents-repo/webapp -f tag=v1.0.0
```

Avoid merging to `main` until the rollback workflow completes.

## PWA and service worker notes

The production build includes a service worker for same-origin static assets.
`/sitemap.xml` and `/robots.txt` are excluded from the navigation fallback
(`navigateFallbackDenylist`) so browser requests receive the static crawl files
instead of the SPA shell. Hashed asset
filenames provide cache busting on new releases. For local service worker
debugging steps, see [development.md](development.md).
