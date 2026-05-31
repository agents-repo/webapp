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
- update docs with behavior changes
- favor root-cause fixes over presentation-only patches
- avoid adding hidden conventions that are not documented

## Source of Truth

The main contributor instructions live in:

- `.github/copilot-instructions.md`
- `.github/CONTRIBUTING.md`
- `.github/pull_request_template.md`

Project-specific decision records live in:

- `docs/styling-and-technology.md`
- `docs/architecture/ddd-decision.md`

If code and docs disagree, update one of them in the same change.
