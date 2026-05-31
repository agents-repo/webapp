# Webapp Project Guidelines

## Project Purpose

This repository contains the web application for browsing, searching, and
downloading agents and flows from the registry.

The project is AI-first. Contributors and coding agents are expected to keep
implementation, workflows, and documentation aligned so tasks can be completed
without relying on undocumented tribal knowledge.

## Primary References

Before introducing a new convention, check these files first:

- `README.md`
- `docs/development.md`
- `docs/ai-collaboration.md`
- `.github/CONTRIBUTING.md`
- `.github/pull_request_template.md`

If a change alters local setup, contributor workflow, review expectations, or
validation commands, update the affected docs in the same change.

## Code and UI Expectations

- Prefer small, targeted changes over broad rewrites.
- Preserve the Vite + React + TypeScript structure already in place.
- Keep Bootstrap usage consistent with the existing theme entrypoint in `src/`.
- Favor accessible, deterministic UI behavior over clever abstractions.
- Avoid adding dependencies unless they clearly reduce maintenance cost.

## Validation

Before handing off work, run the relevant subset of:

1. `npm run env:check`
2. `npm run lint:all`
3. `npm run typecheck`
4. `npm run build`

If a command cannot be run, explicitly say why in the handoff.

## Documentation Standard

Any user-facing behavior, contributor workflow, or AI workflow change should be
documented. At minimum, update the nearest relevant document instead of leaving
new expectations only in code or CI.

## Pull Requests

Use `.github/pull_request_template.md` for PR descriptions. Summaries should be
concrete about:

- what changed
- why it changed
- how it was validated
- any follow-up work that remains

`## Related Issues` MUST include `Closes #<issue-number>`.
Every PR targeting `main` MUST close a tracking issue.

When opening tracking issues, agents MUST use the matching category form in
`.github/ISSUE_TEMPLATE/`:

- bug or inconsistency: `.github/ISSUE_TEMPLATE/bug-inconsistency.yml`
- spec change: `.github/ISSUE_TEMPLATE/spec-change.yml`
- feature proposal: `.github/ISSUE_TEMPLATE/feature-proposal.yml`
- task or chore: `.github/ISSUE_TEMPLATE/task-chore.yml`

Documentation-only work uses the task/chore issue category and the `docs/`
branch prefix.

Branch names MUST follow `<prefix>/<issue-number>-<slug>`, where `<slug>` is
short lowercase kebab-case.

Use the prefix that matches the work category:

- bug or inconsistency: `fix/`
- spec change: `spec/`
- feature proposal: `feat/`
- task or chore: `chore/`
- documentation-only work: `docs/`

## GitHub Communication Method (gh CLI Preferred)

For GitHub communication in this repository, agents and contributors SHOULD use
`gh` CLI as the preferred interface for issue and pull request operations.

Preferred command patterns:

- view issue context: `gh issue view <number> --repo agents-repo/webapp`
- update issue title/body:
  `gh issue edit <number> --repo agents-repo/webapp --title "..." --body-file <file>`
- create issue:
  `gh issue create --repo agents-repo/webapp --title "..." --body-file <file>`
- create draft PR:
  `gh pr create --repo agents-repo/webapp --draft --title "..." --body-file <file>`
- inspect PR status:
  `gh pr view <number> --repo agents-repo/webapp --json state,url,title`

For long issue or PR bodies, agents MUST prefer `--body-file` over inline
quoted text to avoid shell escaping and truncation issues.

If `gh` is unavailable in a task environment, agents MAY use the available
tooling path, but MUST explicitly note that limitation in the handoff summary.
