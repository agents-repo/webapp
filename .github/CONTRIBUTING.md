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
2. Open an issue using `.github/ISSUE_TEMPLATE/` before starting implementation.
3. Create a non-`main` branch from the latest `main` and keep it focused on one change set.
4. Identify the commands needed to validate the work.

## GitHub Communication Method (Preferred)

Contributors and agents SHOULD use `gh` CLI as the preferred method to
communicate with GitHub for issues and pull requests.

Recommended flow:

1. Inspect and confirm issue scope:
   `gh issue view <number> --repo agents-repo/webapp`
2. Create and switch to a feature branch from `main`.
3. Open a draft pull request to `main` with the required template sections:
   `gh pr create --repo agents-repo/webapp --draft --title "..." --body-file <file>`

For long issue/PR descriptions, use `--body-file` to avoid shell escaping and
truncation issues.

## Branch Naming

Use a descriptive lowercase branch name with a clear prefix, such as:

- `feat/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

## Commit Message Convention

Use conventional-style summaries when possible:

- `feat: add baseline PR workflow`
- `docs: expand contributor guidance`
- `chore: pin node and npm versions`

## Local Validation

Before requesting review, run:

```bash
npm run env:check
npm run lint:all
npm run typecheck
npm run build
```

This repository uses a Husky pre-commit hook that runs `npm run lint:all`.

## Pull Requests

1. Keep PRs reviewable and scoped.
2. Use `.github/pull_request_template.md`.
3. In `## Related Issues`, include `Closes #<issue-number>` for issue-linked
   work; if no issue exists, include a short rationale.
4. List the validation commands you ran.
5. Call out any documentation or workflow impact.
6. If the PR template cannot be applied, include the same required sections manually.

## AI Collaboration

AI agents should not rely on implicit project knowledge. If a change introduces
a new expectation for setup, validation, architecture, or contribution flow,
document it in `README.md`, `docs/`, or `.github/` in the same change.
