# Deployment

The webapp is published to GitHub Pages at:

- <https://agents-repo.github.io/>

Each GitHub Release in `agents-repo/webapp` triggers a build and deploy of the
static `dist/` output to `agents-repo/agents-repo.github.io`.

## How deployment works

1. A releasable conventional commit is merged to `main`.
2. The **Release** workflow runs validation and `semantic-release`, creating a
   `v<MAJOR>.<MINOR>.<PATCH>` tag and GitHub Release when applicable.
3. When semantic-release publishes a new release, `@semantic-release/exec`
   writes `published=true` and the release tag to `$GITHUB_OUTPUT`. The
   **Release** workflow then chains to **Pages Deploy** via `workflow_call`,
   checks out the release tag, runs `npm run build:pages`, and pushes `dist/` to
   the Pages repository `main` branch.

Automated releases use `GITHUB_TOKEN`, which does not trigger `release:
published` in separate workflows. Chaining deploy from the Release workflow
avoids that GitHub Actions limitation.

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

## Smoke checks after deploy

1. Open <https://agents-repo.github.io/>.
2. Verify deep links: `/about`, `/contact`, `/help-us`.
3. Confirm the registry catalog loads (default proxy source).

## Rollback

Redeploy a prior `v*` tag using the manual redeploy workflow. For example, to
roll back from `v1.1.0` to `v1.0.0`:

```bash
gh workflow run pages-deploy.yml --repo agents-repo/webapp -f tag=v1.0.0
```

## PWA and service worker notes

The production build includes a service worker for same-origin static assets.
Hashed asset filenames provide cache busting on new releases. For local
service worker debugging steps, see [development.md](development.md).
