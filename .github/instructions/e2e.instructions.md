---
applyTo: "e2e/**"
description: "Use for Playwright end-to-end tests."
---

# Webapp E2E Instructions

- Follow `.github/CONTRIBUTING.md` **Required Workflow** (issue → branch →
  draft PR before implementation).
- Follow [docs/e2e-testing.md](../../docs/e2e-testing.md) for conventions and
  fixtures.
- Run `npm run test:e2e` when changing flows, routing, or registry
  integration (requires `npx playwright install chromium` once per machine).
