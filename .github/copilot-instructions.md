# Webapp Project Guidelines

## Project Purpose

This repository contains the web application for browsing, searching, and
downloading agents and flows from the registry.

The project is AI-first. Contributors and coding agents are expected to keep
implementation, workflows, and documentation aligned so tasks can be completed
without relying on undocumented tribal knowledge.

## Primary References

Before making any change, agents MUST consult the relevant source-of-truth
docs/specs first.

Mandatory for all changes:

- `README.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/ARCHITECTURE.md`
- `.github/CONTRIBUTING.md`
- `.github/pull_request_template.md`

Mandatory for UI and accessibility changes:

- `docs/accessibility.md`
- `docs/e2e-testing.md` (when changing UI flows, routing, or registry integration)

Mandatory before structural, architectural, styling, or technology stack
changes:

- `docs/ai-collaboration.md`
- `docs/styling-and-technology.md`
- `docs/architecture/ddd-decision.md`
- `docs/architecture/accessibility-decision.md`

If a change alters local setup, contributor workflow, review expectations,
validation commands, architecture, project structure, styling model, or
technology/tooling choices, update the affected docs/specs in the same change.

If code and docs/specs disagree, resolve the mismatch in the same change by
updating docs/specs or aligning implementation.

## Architectural and Tech Stack Decisions

Do NOT change module boundaries, project structure, styling approach, or the
technology stack without updating the corresponding decision docs in the same
pull request.

For this repository, this includes:

- `docs/architecture/ddd-decision.md` for module boundaries and architecture
  rules
- `docs/styling-and-technology.md` for styling model and stack/tooling choices

If no existing decision record is sufficient, create or update the nearest
relevant document under `docs/` in the same change before considering the work
complete.

## Code and UI Expectations

- Prefer small, targeted changes over broad rewrites.
- Preserve the Vite + React + TypeScript structure already in place.
- Keep Bootstrap usage consistent with the existing theme entrypoint in
  `src/styles/bootstrap-theme.scss`.
- Author app styling in SCSS only. Do not introduce new `.css` files for application styles.
- Keep the base styling split between `src/index.scss`, `src/App.scss`, and
  `src/styles/bootstrap-theme.scss` unless a new SCSS file is explicitly
  documented.
- Favor accessible, deterministic UI behavior over clever abstractions.
- Avoid adding dependencies unless they clearly reduce maintenance cost.

## Validation

Before handing off work, run the relevant subset of:

1. `npm run env:check`
2. `npm run lint:all`
3. `npm run test`
4. `npm run typecheck`
5. `npm run build:pages`
6. `npm run test:crawl-files` (after `build:pages`; see `docs/seo.md`)

For UI or accessibility changes, also run `npm run test:a11y` and `npm run a11y:ci`
after `build:pages`. For routing, modals, or registry integration, also run
`npm run test:e2e` locally (requires `npx playwright install chromium` once per
machine). See `docs/testing.md`, `docs/accessibility.md`, and `docs/e2e-testing.md`.

If a command cannot be run, explicitly say why in the handoff.

Local handoff keeps this full set. PR baseline CI path-filters Chrome/`slides:check`,
`agents:ci`, and Pages/crawl extras. npm lockfiles do **not** trigger `agents:ci`.
See the organization
[PR baseline extras (path filters)](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pr-baseline-extras-path-filters).

## Pre-ready handoff

Before handoff on a task branch, agents MUST complete the organization
[Pre-ready agent handoff](https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md#pre-ready-agent-handoff)
norm, run the **Validation** commands above for the change scope, perform a
self-review, and update the **draft** PR with evidence. Agents MUST NOT mark
pull requests ready for review. After editing `.github/copilot-instructions.md`, run
`npm run sync:ide-instructions`. Optional Cursor-only self-review is documented
in `docs/ai-collaboration.md`.

## Documentation Standard

Any user-facing behavior, contributor workflow, architectural decision,
technology stack decision, or AI workflow change MUST be documented.

At minimum, update the nearest relevant docs/specs instead of leaving new
expectations only in code or CI. Undocumented decision-impacting work is
incomplete.

## Pull Requests

Use `.github/pull_request_template.md`. See
[CONTRIBUTING.md — Required Workflow](.github/CONTRIBUTING.md#required-workflow).

## Required Workflow (Task Start)

Follow `.github/CONTRIBUTING.md` **Required Workflow** (issue form → branch →
draft PR before implementation). Agents MUST NOT push to `main`, merge PRs into
`main`, or mark pull requests ready for review.

## Path-scoped Copilot instructions

GitHub Copilot loads norms from `.github/instructions/*.instructions.md` when
`applyTo` matches edited paths. Do not duplicate those bodies here.

## Default Branch Integration (Agents)

Agents MUST NOT merge or push to `main`. Integration is human-only after review.

## GitHub Communication (gh CLI)

Prefer `gh` for issues and draft PRs. See `.github/CONTRIBUTING.md`.

## Cursor Cloud environment

See [agents-repo/.github docs/cursor-cloud.md](https://github.com/agents-repo/.github/blob/main/docs/cursor-cloud.md).
Vite dev server: `webapp-dev` terminal (`http://localhost:5173`). Run
`npx playwright install chromium` when E2E is needed.

After editing `.github/copilot-instructions.md`, run `npm run sync:ide-instructions`.
