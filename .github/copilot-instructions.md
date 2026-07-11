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
5. `npm run build`

For UI or accessibility changes, also run `npm run test:a11y`. See
`docs/testing.md` and `docs/accessibility.md`.

If a command cannot be run, explicitly say why in the handoff.

## Documentation Standard

Any user-facing behavior, contributor workflow, architectural decision,
technology stack decision, or AI workflow change MUST be documented.

At minimum, update the nearest relevant docs/specs instead of leaving new
expectations only in code or CI. Undocumented decision-impacting work is
incomplete.

## Pull Requests

Use `.github/pull_request_template.md` for PR descriptions. Summaries should be
concrete about:

- what changed
- why it changed
- how it was validated
- any follow-up work that remains

`## Related Issues` MUST include a tracking reference: `Closes #<issue-number>`
for standard tasks, or the security-advisory format defined in the **Workflow
exceptions** section of `.github/CONTRIBUTING.md` when applicable.
Every PR targeting `main` MUST include a tracking reference.

## Required Workflow (Task Start)

Before implementation, agents MUST:

1. Open a tracking issue (matching issue form when available).
2. Create a branch named `<prefix>/<issue-number>-<slug>`.
3. Push the branch and open a draft pull request before implementation commits.
   Pull requests MUST be created as drafts (`gh pr create --draft`). In
   `## Related Issues`, include `Closes #<issue-number>` for standard tasks, or
   follow the security-advisory format defined in the **Workflow exceptions**
   section of `.github/CONTRIBUTING.md` when applicable. GitHub cannot open a
   PR when head and base are identical; push a scaffolding commit on the task
   branch first if needed (see `.github/CONTRIBUTING.md`).

Agents MAY push additional commits to the task branch when requested.
Agents MUST NOT push to `main`, merge PRs into `main`, or mark pull requests
ready for review.
After validation, the developer manually marks the pull request ready for
review; agents MUST NOT perform that step.
Agents MUST complete requested implementation work on the task branch, then
hand off. Ready-for-review and merge are for a human maintainer.

Task start in this organization authorizes workflow scaffolding (issue,
branch, draft PR) even when generic tooling rules defer commits until
requested. Repo-level agent instructions govern this workspace and supersede
generic commit or pull request timing rules for workflow setup steps.

## Default Branch Integration (Agents)

- AI agents and coding assistants MUST NOT merge pull requests into `main`
  (including `gh pr merge`, squash/rebase merge, or local `git merge` followed
  by push).
- AI agents MUST NOT push commits directly to `main`.
- Integration to `main` is a human-only, manual step performed by maintainers
  after review. All contributors MUST deliver changes to `main` only through
  merged pull requests.
- Agents MUST complete requested implementation work on the task branch, then
  hand off and state that merge is for a human maintainer.

## Issue and PR Template Enforcement

When opening tracking issues, agents MUST use the matching category form in
`.github/ISSUE_TEMPLATE/`:

- bug or inconsistency: `.github/ISSUE_TEMPLATE/bug-inconsistency.yml`
- spec change: `.github/ISSUE_TEMPLATE/spec-change.yml`
- feature proposal: `.github/ISSUE_TEMPLATE/feature-proposal.yml`
- task or chore: `.github/ISSUE_TEMPLATE/task-chore.yml`

Documentation-only work uses the task/chore issue category and the `docs/`
branch prefix.

When opening a pull request, the agent MUST follow
`.github/pull_request_template.md`.

The agent MUST report template usage in its final PR handoff summary,
including which issue form was used and confirmation that the PR body
follows `.github/pull_request_template.md`.

If the available tool path cannot programmatically apply a template, the
agent MUST explicitly state that limitation and MUST include all required
sections from the intended template in the issue or PR body.

Branch names MUST follow `<prefix>/<issue-number>-<slug>`, where `<slug>` is
short lowercase kebab-case.

Use the prefix that matches the work category:

- bug or inconsistency: `fix/`
- spec change: `spec/`
- feature proposal: `feat/`
- task or chore: `chore/`
- documentation-only work: `docs/`

## Commit Message Convention

See `.github/CONTRIBUTING.md` for conventional commit prefixes and
semantic-release mapping. Agents MUST follow that convention when creating
commits.

## GitHub Communication Method (gh CLI Preferred)

For GitHub communication in this repository, agents and contributors SHOULD use
`gh` CLI as the preferred interface for issue and pull request operations.

Preferred command patterns:

- view issue context: `gh issue view <number> --repo agents-repo/webapp`
- update issue title/body:
  `gh issue edit <number> --repo agents-repo/webapp --title "..." --body-file <file>`
- create issue:
  `gh issue create --repo agents-repo/webapp --title "..." --body-file <file>`
- create draft PR (MUST use `--draft`):
  `gh pr create --repo agents-repo/webapp --draft --title "..." --body-file <file>`
- inspect PR status:
  `gh pr view <number> --repo agents-repo/webapp --json state,url,title`

For long issue or PR bodies, agents MUST prefer `--body-file` over inline
quoted text to avoid shell escaping and truncation issues.

If `gh` is unavailable in a task environment, agents MAY use the available
tooling path, but MUST explicitly note that limitation in the handoff summary.
