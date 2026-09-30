---
title: Contributing to webapp
description: Branch workflow and validation for the webapp repository.
order: 130
section: Contribute
---

This site is developed in [agents-repo/webapp](https://github.com/agents-repo/webapp).

## Required workflow

1. Open a tracking issue (see `.github/ISSUE_TEMPLATE/`).
2. Branch: `<prefix>/<issue-number>-<slug>` using the prefix that matches the work:

   | Work type | Prefix | Example |
   | --- | --- | --- |
   | Bug or inconsistency | `fix/` | `fix/42-related-issues-checklist` |
   | Spec change | `spec/` | `spec/57-pr-policy-clarity` |
   | Feature proposal | `feat/` | `feat/89-search-refinement` |
   | Task or chore | `chore/` | `chore/31-sync-workflow-docs` |
   | Documentation-only work | `docs/` | `docs/88-update-pr-guidance` |

3. Open a **draft** pull request with `Closes #<issue>`.
4. Run validation before handoff; a human maintainer marks the PR ready for review.

Full rules: [webapp CONTRIBUTING](https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md), [organization Required Workflow](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow), and the [organization branch prefix reference](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#branch-prefix-reference).

## Local validation

```bash
npm run env:check
npm run lint:all
npm run test
npm run typecheck
npm run build:pages
npm run test:crawl-files
```

For UI changes, also run `npm run test:a11y` and `npm run test:e2e` when applicable.

PR baseline CI path-filters Chrome/`slides:check`, Pages/crawl, and CLI
`check:docs-sync` extras (no `agents:verify` in this repository). See the organization
[PR baseline extras policy](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pr-baseline-extras-path-filters)
and [docs/ci.md](https://github.com/agents-repo/.github/blob/main/docs/ci.md).

## Registry workflow packages (org hub)

This repository does **not** commit `agents.json`. Shared planning/review packages
install in [agents-repo/.github](https://github.com/agents-repo/.github). Open
[agents-repo.code-workspace](https://github.com/agents-repo/.github/blob/main/agents-repo.code-workspace)
from the `.github` sibling clone. See
[org-workspace-and-agents.md](https://github.com/agents-repo/.github/blob/main/docs/org-workspace-and-agents.md).

End-user install docs ([Installing packages](/docs/installing-packages)) still apply to **your own** projects.

## Guide content

Site docs live in `src/content/docs/`. When CLI or registry workflows change, update the relevant doc pages manually (see [docs/development.md](https://github.com/agents-repo/webapp/blob/main/docs/development.md)).

Repository page: [/repositories/webapp](/repositories/webapp).
