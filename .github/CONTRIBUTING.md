# Contributing

Thanks for contributing to the webapp.

## Project Focus

This repository is the frontend for the agents registry. Most changes will be
UI, UX, integration, documentation, or workflow updates.

Because this is an AI-first project, contributor guidance must stay explicit.
When you change setup, automation, or review expectations, update the matching
docs in the same pull request.

## Before You Start

1. Confirm the task scope and expected outcome.
2. Open an issue using the matching form in
   `.github/ISSUE_TEMPLATE/` before starting implementation.
3. Create a non-`main` branch from the latest `main` and keep it focused on one change set.
4. Identify the commands needed to validate the work.

Issue form selection MUST match one of these categories:

| Category | Issue form |
| --- | --- |
| Bug or inconsistency | `.github/ISSUE_TEMPLATE/bug-inconsistency.yml` |
| Spec change | `.github/ISSUE_TEMPLATE/spec-change.yml` |
| Feature proposal | `.github/ISSUE_TEMPLATE/feature-proposal.yml` |
| Task or chore | `.github/ISSUE_TEMPLATE/task-chore.yml` |

Documentation-only work uses the task/chore issue category and the `docs/`
branch prefix.

If template application is not possible, manually include equivalent sections
in the issue body.

## GitHub Communication Method (Preferred)

Contributors and agents SHOULD use `gh` CLI as the preferred method to
communicate with GitHub for issues and pull requests.

Recommended flow:

1. Inspect and confirm issue scope:
   `gh issue view <number> --repo agents-repo/webapp`
2. Create and switch to a non-`main` branch from the latest `main` using the
   naming rules in this guide.
3. Open a draft pull request to `main` with the required template sections:
   `gh pr create --repo agents-repo/webapp --draft --title "..." --body-file <file>`

For long issue/PR descriptions, use `--body-file` to avoid shell escaping and
truncation issues.

## Branch Naming

Branch names must follow `<prefix>/<issue-number>-<slug>`, where `<slug>` is
short lowercase kebab-case.

| Work type | Prefix | Example |
| --- | --- | --- |
| Bug or inconsistency | `fix/` | `fix/42-related-issues-checklist` |
| Spec change | `spec/` | `spec/57-pr-policy-clarity` |
| Feature proposal | `feat/` | `feat/89-search-refinement` |
| Task or chore | `chore/` | `chore/31-sync-workflow-docs` |
| Documentation-only work | `docs/` | `docs/88-update-pr-guidance` |

Create the issue first to obtain the issue number, then open the branch.

## Commit Message Convention

Use conventional-style summaries when possible:

- `feat: add baseline PR workflow`
- `docs: expand contributor guidance`
- `chore: pin node and npm versions`

## Release Workflow

- Release versions use Semantic Versioning `MAJOR.MINOR.PATCH` sourced from
  <https://semver.org>.
- Pushes to `main` run release validation checks and then execute
  `semantic-release`.
- A release is published only when commit history includes releasable changes
  per the commit-to-version mapping below.
- `workflow_dispatch` remains available for operational checks.
- The `dry_run` input defaults to `true`; use `dry_run=false` only when an
  intentional manual publish is run from `main`.

The semantic version value remains `<MAJOR>.<MINOR>.<PATCH>`. Release tags may
use the common `v<MAJOR>.<MINOR>.<PATCH>` convention without changing the
underlying version value.

Commit-to-version mapping for automated releases:

- `type!:` or `BREAKING CHANGE:` => `MAJOR`
- `feat:` => `MINOR`
- `fix:`, `perf:`, and `revert:` => `PATCH`

Commit types not listed above do not trigger an automated release.

Published releases deploy the built webapp to
<https://agents-repo.org/>. See [docs/deployment.md](../docs/deployment.md)
for PAT setup and redeploy instructions.

When merging release-automation work, use a squash-merge title with `feat:` if
the merge should trigger the first GitHub Release.

## Local Validation

Before requesting review, run:

```bash
npm run env:check
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
```

For UI or accessibility changes, also run `npm run test:a11y` and `npm run a11y:ci`
after `build:pages`. Browser scans are local-only, not PR baseline CI. See
[docs/accessibility.md](../docs/accessibility.md).

For routing, registry integration, or modal flows, also run `npm run test:e2e`
locally (requires `npx playwright install chromium` once per machine). E2E is
local-only, not PR baseline CI. See [docs/e2e-testing.md](../docs/e2e-testing.md).

Unit test conventions and the coverage backlog are in
[docs/testing.md](../docs/testing.md). Playwright E2E conventions are in
[docs/e2e-testing.md](../docs/e2e-testing.md).

This repository uses a Husky pre-commit hook that runs `npm run lint:all`.

Note: `LICENSE` is intentionally excluded from workspace markdownlint checks.
The file is kept as canonical plain-text license content for compatibility with
GitHub license detection and compliance tooling.

## Pull Requests

1. Keep PRs reviewable and scoped.
2. Use `.github/pull_request_template.md`.
3. In `## Related Issues`, include `Closes #<issue-number>`.
4. Every PR targeting `main` must close a tracking issue.
5. List the validation commands you ran.
6. Call out any documentation or workflow impact.
7. If the PR template cannot be applied, include the same required sections manually.

## AI Collaboration

AI agents should not rely on implicit project knowledge. If a change introduces
a new expectation for setup, validation, architecture, or contribution flow,
document it in `README.md`, `docs/`, or `.github/` in the same change.
