# Deployment

The webapp is published to GitHub Pages at:

- <https://agents-repo.org/> (custom domain)
- <https://agents-repo.github.io/> (legacy; client redirect to custom domain after deploy)

Each GitHub Release in `agents-repo/webapp` triggers a build and deploy of the
static `dist/` output to `agents-repo/agents-repo.github.io`. Site content
changes belong in this repository; `agents-repo.github.io` is the automated
deployment target only.

## How deployment works

1. A maintainer merges a releasable conventional commit to `main` (agents must
   not perform this step).
2. The **Release** workflow runs validation and `semantic-release`, creating a
   `v<MAJOR>.<MINOR>.<PATCH>` tag and GitHub Release when applicable.
3. When semantic-release publishes a new release, the **Release** workflow
   `release-publish` job fetches tags (`git fetch --tags`), detects the tag on
   HEAD (`git tag --points-at HEAD`), and runs `npm run build:pages` plus
   `peaceiris/actions-gh-pages` as conditional steps in the same job.

Automated releases use `GITHUB_TOKEN`, which does not trigger `release:
published` in separate workflows. Inline deploy in the Release workflow avoids
that GitHub Actions limitation. Use the **Pages Deploy** workflow for manual
redeploy of an existing tag.

The `build:pages` script adds GitHub Pages SPA support:

- `404.html` copied from `index.html` for client-side routing
- `.nojekyll` to disable Jekyll processing

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

The Pages Deploy workflow passes this secret to
`peaceiris/actions-gh-pages@v4` as the `personal_token` input (required for
cross-repo pushes).

Deploy commits appear under the PAT owner's GitHub account, not
`github-actions[bot]`.

## First release sequencing

1. Merge the release-automation PR with squash title
   `feat: add semantic-release and GitHub Pages deploy` to trigger `v1.0.0`.
2. Configure `PAGES_DEPLOY_TOKEN` before or immediately after merge.
3. If Pages deploy fails because the secret was missing, redeploy manually (see
   below) — no new release is required.

## Manual redeploy

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

Redeploy a prior `v*` tag using the manual redeploy workflow. For example, to
roll back from `v1.1.0` to `v1.0.0`:

```bash
gh workflow run pages-deploy.yml --repo agents-repo/webapp -f tag=v1.0.0
```

## PWA and service worker notes

The production build includes a service worker for same-origin static assets.
`/sitemap.xml` is excluded from the navigation fallback (`navigateFallbackDenylist`)
so browser requests receive the XML file instead of the SPA shell. Hashed asset
filenames provide cache busting on new releases. For local service worker
debugging steps, see [development.md](development.md).
