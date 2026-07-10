# AI Collaboration

## AI-First Expectations

This repository is designed to work well with GitHub Copilot and other coding
agents. Documentation, prompts, and review guidance should be explicit enough
for both humans and AI tools to follow without guessing intent.

## Required Inputs for AI Tasks

When opening an issue or PR, include:

- the problem to solve
- the expected outcome
- any constraints, especially around UI behavior and validation
- the commands used to verify the change

## Preferred Change Style

- keep changes narrow and reversible
- update docs/specs with behavior and decision changes in the same change
- favor root-cause fixes over presentation-only patches
- avoid adding hidden conventions that are not documented

## Documentation-First Enforcement

Before making any change, agents MUST consult the relevant source-of-truth
docs/specs.

Mandatory for all changes:

- `.github/copilot-instructions.md`
- `.github/CONTRIBUTING.md`
- `.github/pull_request_template.md`
- `README.md`
- `docs/development.md`

Mandatory before structural, architectural, styling, or technology stack
changes:

- `docs/styling-and-technology.md`
- `docs/architecture/ddd-decision.md`

If a change alters setup, validation, contributor workflow, architecture,
project structure, styling model, or technology/tooling choices, agents MUST
update the affected docs/specs in the same change.

If no existing decision record is sufficient, agents MUST create or update the
nearest relevant document under `docs/` in the same change.

Undocumented decision-impacting work is incomplete.

Do NOT change module boundaries, project structure, styling approach, or the
technology stack without updating corresponding decision docs in the same pull
request.

## Source of Truth

The main contributor instructions live in:

- `.github/copilot-instructions.md`
- `.cursor/rules/agents-webapp.mdc` (generated from copilot instructions)
- `.github/CONTRIBUTING.md`
- `.github/pull_request_template.md`

After editing `.github/copilot-instructions.md`, regenerate the Cursor rule:

```bash
npm run sync:cursor-rules
```

## Default branch integration

Every task MUST follow the organization Required Workflow before
implementation:

1. Open a tracking issue (matching issue form; except security vulnerabilities
   — see **Workflow exceptions** in `.github/CONTRIBUTING.md`).
2. Create a branch named `<prefix>/<issue-number>-<slug>`.
3. Push a scaffolding commit if needed, then open a draft pull request before
   implementation commits (`gh pr create --draft`). In `## Related Issues`,
   include `Closes #<issue-number>` for standard tasks, or follow the
   security-advisory format defined in the **Workflow exceptions** section of
   `.github/CONTRIBUTING.md` when applicable.
4. After validation passes, the developer manually marks the pull request ready
   for review. Agents MUST NOT mark pull requests ready for review.
5. Hand off for human maintainer review and merge.

Agents MUST NOT merge to or push directly to `main`, and MUST NOT mark pull
requests ready for review. See
`## Required Workflow (Task Start)` and
`## Default Branch Integration (Agents)` in `.github/copilot-instructions.md`.

Project-specific decision records live in:

- `docs/styling-and-technology.md`
- `docs/architecture/ddd-decision.md`

If code and docs disagree, update one of them in the same change.
