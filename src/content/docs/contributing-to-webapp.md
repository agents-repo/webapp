---
title: Contributing to webapp
description: Branch workflow, validation, and agents-repo workflow packages in this repository.
order: 130
section: Contribute
---

This site is developed in [agents-repo/webapp](https://github.com/agents-repo/webapp).

## Required workflow

1. Open a tracking issue (see `.github/ISSUE_TEMPLATE/`).
2. Branch: `<prefix>/<issue-number>-<slug>` (for example `feat/112-guide-sidebar-markdown`).
3. Open a **draft** pull request with `Closes #<issue>`.
4. Run validation before handoff; a human maintainer marks the PR ready for review.

Full rules: [webapp CONTRIBUTING](https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md) and [organization Required Workflow](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#required-workflow).

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

## Registry workflow packages in this repo

The webapp pins `agents-repo` in **devDependencies** and uses:

```bash
npm run agents:install
npm run agents:update
npm run agents:ci
```

Commit `agents.json`, `agents-lock.json`, and extracted agent paths. See [Installing packages](/docs/installing-packages).

## Guide content

Site docs live in `src/content/docs/`. When CLI or registry workflows change, update the relevant doc pages manually (see [docs/development.md](https://github.com/agents-repo/webapp/blob/main/docs/development.md)).

Repository page: [/repositories/webapp](/repositories/webapp).
