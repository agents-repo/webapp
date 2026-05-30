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
2. Keep the branch focused on one change set.
3. Identify the commands needed to validate the work.

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

## Pull Requests

1. Keep PRs reviewable and scoped.
2. Use `.github/pull_request_template.md`.
3. List the validation commands you ran.
4. Call out any documentation or workflow impact.

## AI Collaboration

AI agents should not rely on implicit project knowledge. If a change introduces
a new expectation for setup, validation, architecture, or contribution flow,
document it in `README.md`, `docs/`, or `.github/` in the same change.
