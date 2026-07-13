# Webapp

Web interface for browsing, searching, and downloading agents and flows from
the registry.

## Purpose

This repository contains the frontend application for the agents registry.
It is a Vite + React + TypeScript project with Bootstrap-based styling and an
AI-first contributor workflow.

## Stack

- React 19
- TypeScript
- Vite
- Bootstrap, SCSS, React Bootstrap, and Font Awesome React
- Bootstrap 5.3 color modes with a header dropdown for light, dark, and auto
- PWA service worker runtime caching through `vite-plugin-pwa`
- In-app 24h registry index cache semantics using a lightweight in-memory LRU
  policy + persistent browser storage
- ESLint for code linting
- markdownlint for Markdown quality checks

## Getting Started

Use the pinned toolchain where possible:

- Node.js 24.x, with `.nvmrc` pinned to `24.18.0`
- npm 12.x, with `packageManager` pinned to `npm@12.0.1`

Install dependencies and start the app:

```bash
npm install
npm run dev
```

## Common Commands

```bash
npm run env:check
npm run lint:all
npm run test
npm run test:watch
npm run test:e2e
npm run typecheck
npm run build
npm run build:pages
```

Accessibility-focused checks (local only, not in PR baseline CI):

```bash
npm run test:a11y
npm run a11y:ci
```

See [docs/accessibility.md](docs/accessibility.md) for patterns and the public
statement at `/accessibility`.

Public privacy notices: `/privacy` (English) and `/privacidade` (Portuguese).
See [docs/privacy.md](docs/privacy.md) for consent, GTM, and contributor guidance.

See [docs/seo.md](docs/seo.md) for search and social-preview metadata patterns.

See [docs/testing.md](docs/testing.md) for unit test conventions, coverage map,
and the prioritized test backlog. Playwright E2E (local-only) is documented in
[docs/e2e-testing.md](docs/e2e-testing.md).

## Registry Source Configuration

The app resolves the registry source URL with runtime-first precedence:

1. Browser runtime override saved from Website settings in the header (cog icon)
2. Build-time Vite `VITE_...` environment variables
3. Repository defaults

Build-time variables remain:

- `VITE_REGISTRY_REPOSITORY_URL`: source URL input. This may be a GitHub
  repository URL or a direct source endpoint URL. Default:
  `https://registry-proxy.maiconfz.workers.dev?ref=v2.x`
- `VITE_REGISTRY_BASE_URL`: optional direct base URL override for fetches.
  If omitted, the source URL is used as the base URL (GitHub URLs are normalized to raw content).
- `VITE_REGISTRY_INDEX_PATH`: relative index path. Default:
  `packages/index.json`
- `VITE_REGISTRY_GITHUB_REPOSITORY_URL`: GitHub repository URL used for package
  browse links in package cards. Default:
  `https://github.com/agents-repo/registry/tree/v2.x`

GitHub repository URLs and `/tree/<ref>` or `/blob/<ref>` URLs are normalized
to `raw.githubusercontent.com`. When a tree/blob URL includes additional
repository path segments (for example `/tree/main/packages`), only the first
ref segment is used for derivation. To use slash refs, provide an explicit ref
form such as `/tree/refs/heads/feature/foo`.

With defaults, the configured source uses the `v2.x` major-version line alias.
At catalog load time this resolves to the latest stable release tag (for example
`v2.0.0`). Before resolution, the index URL is composed as:

`https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v2.x`

Query parameters on the source URL are preserved when composing the index URL,
except when GitHub URLs are normalized to raw content URLs.

Major-version line refs such as `1.x` or `v1.x` can be used in proxy `?ref=`
values or GitHub `/tree/<ref>` URLs. The app resolves these aliases to the latest
stable release tag from the registry repository using registry-proxy `GET /tags`
when the fetch source is a proxy URL, or the GitHub tags API as a fallback for
GitHub-only source URLs. Tag selection uses [`semver`](https://www.npmjs.com/package/semver).
Resolved refs are shown in website settings and catalog status notes as
`v2.x → v2.0.0`.

At runtime, users can set custom registry URLs in the header settings modal:

- **Registry base URL override** — catalog fetching (GitHub URLs auto-normalized,
  raw URLs and other base URLs used as-is). Empty resets to configured defaults.
- **GitHub repository URL** — package browse links only; opens
  `github.com/.../tree/{ref}/packages/{id}` in package card footers. Independent
  from the fetch override. Empty resets to `VITE_REGISTRY_GITHUB_REPOSITORY_URL`.

Fetch defaults (proxy) and browse defaults (GitHub repository) serve different
purposes. A proxy fetch URL cannot be converted into a GitHub tree browse link.

Note: URL format flexibility does not change the expected registry layout. The
resolved base URL must expose a compatible registry structure, including a
valid `packages/index.json` (or the configured `VITE_REGISTRY_INDEX_PATH`)
that matches the app's registry catalog contract.

## Caching and Offline Behavior

Registry catalog loading now uses two coordinated cache layers:

- App-layer cache contract:
  - 24h freshness window for `index.json`
  - Fresh cache is used before network fetches
  - If remote refresh fails, stale cached catalog is used when available
  - If refresh fails and no cached catalog exists, the app shows an error alert
- Service worker runtime cache:
  - Focused caching for same-origin static assets only

This keeps registry freshness decisions in app logic while still improving
offline resilience for app assets.

## GitHub CLI

This repository prefers GitHub communication through `gh` CLI for issue and
pull request workflows.

Verify availability and authentication:

```bash
gh --version
gh auth status
```

If `gh auth status` reports no login, run `gh auth login`.

Common commands used in this workflow:

```bash
# inspect issue scope
gh issue view <number> --repo agents-repo/webapp

# open a draft PR with template-aligned content
gh pr create --repo agents-repo/webapp --draft --title "..." --body-file <file>
```

See `.github/CONTRIBUTING.md` **Required Workflow** for the canonical policy
(issue → branch → push → draft PR before implementation).

Issue categories in this repository are:

- bug or inconsistency
- spec change
- feature proposal
- task or chore

Documentation-only work uses the task/chore issue category and a
`docs/<issue-number>-<slug>` branch name.

## Release Workflow

- Release versions follow Semantic Versioning `MAJOR.MINOR.PATCH` sourced from
  <https://semver.org>.
- Pushes to `main` (post-merge integration via pull request, not direct push)
  run release validation checks and then execute `semantic-release`.
- A release is published only when commit history includes releasable changes
  per the commit-to-version mapping below.
- `workflow_dispatch` remains available for operational checks.
- `dry_run` defaults to `true`; set `dry_run=false` only when intentionally
  running a manual publish from `main`.
- Git tags use `v<MAJOR>.<MINOR>.<PATCH>` format.

### Commit-To-Version Mapping

- `type!:` or `BREAKING CHANGE:` => `MAJOR`
- `feat:` => `MINOR`
- `fix:`, `perf:`, and `revert:` => `PATCH`

Commit types not listed above do not trigger an automated release.

### GitHub Pages

Published releases deploy the built webapp to:

- <https://agents-repo.org/>

See [docs/deployment.md](docs/deployment.md) for PAT setup, redeploy, and
rollback instructions.

## IDE Setup

This repository commits a generated Cursor rule mirror so agent instructions
are available on clone without manual setup.

| IDE | Project guidelines |
| --- | --- |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/agents-webapp.mdc` |

Regenerate after editing `copilot-instructions.md`:

```bash
npm run sync:cursor-rules
```

Do not edit `.cursor/rules/agents-webapp.mdc` directly.

## Project Docs

- Development workflow: [docs/development.md](docs/development.md)
- Testing guide: [docs/testing.md](docs/testing.md)
- Deployment and Pages: [docs/deployment.md](docs/deployment.md)
- AI collaboration guidance: [docs/ai-collaboration.md](docs/ai-collaboration.md)
- Styling and technology decisions: [docs/styling-and-technology.md](docs/styling-and-technology.md)
- Architecture and DDD decision: [docs/architecture/ddd-decision.md](docs/architecture/ddd-decision.md)
- Accessibility guide: [docs/accessibility.md](docs/accessibility.md)
- Privacy and analytics guide: [docs/privacy.md](docs/privacy.md)
- SEO guide: [docs/seo.md](docs/seo.md)
- Public accessibility statement: `/accessibility` route in the deployed app
- Public privacy policies: `/privacy` (EN) and `/privacidade` (pt-BR)
- Contributor guide: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
- Copilot project instructions:
  [.github/copilot-instructions.md](.github/copilot-instructions.md)

## Automation

- **PR Baseline Checks** — lint, typecheck, test, and Pages build on pull requests.
- **Release** — validation plus `semantic-release` on pushes to `main`.
- **Pages Deploy** — builds and publishes `dist/` to `agents-repo.github.io` on
  each GitHub Release.
