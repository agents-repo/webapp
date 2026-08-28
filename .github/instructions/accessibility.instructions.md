---
applyTo: "src/**/*.tsx"
description: "Use when editing React components for accessibility-sensitive UI."
---

# Webapp Accessibility Instructions

- Follow `.github/CONTRIBUTING.md` **Required Workflow** (issue → branch →
  draft PR before implementation).
- Follow [docs/accessibility.md](../../docs/accessibility.md) and
  [docs/architecture/accessibility-decision.md](../../docs/architecture/accessibility-decision.md).
- After `npm run build:pages`, run `npm run test:a11y` and `npm run a11y:ci`
  for UI changes.
