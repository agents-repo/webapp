# Accessibility Decision Record

## Status

Accepted — issue #54

## Context

The Agents Repo webapp is a React single-page application using React-Bootstrap.
Issue #54 requires WCAG 2.2 Level AA conformance, reusable accessibility
patterns, contributor documentation, a public accessibility statement, and
automated regression checks in pull request CI.

## Decision

1. **Conformance target:** WCAG 2.2 Level AA
2. **Patterns:** Centralize recurring behavior in `src/modules/site/application/accessibility/`
3. **Enforcement layers:**
   - `eslint-plugin-jsx-a11y` during development
   - `vitest-axe` component smoke tests in PR baseline
   - Lighthouse CI + `pa11y-ci` via `npm run a11y:ci` (local validation only)
4. **Public transparency:** HTML Accessibility Conformance Report at `/accessibility`,
   linked from the footer Legal column only
5. **SPA behavior:** Skip link, per-route `document.title`, route announcer with focus on `#main-content`

## Rationale

### Shared helpers vs ad hoc ARIA

Central helpers keep external-link labeling, titles, and route announcements
consistent and reviewable. They reduce duplicated accessible-name strings across
pages.

### Lighthouse and pa11y together

- **Lighthouse** gives a fast, browser-based accessibility score per route and
  catches issues such as contrast in a real rendering environment.
- **pa11y** maps failures to explicit WCAG 2 AA rules across the same route set.

Using both complements jsdom-based axe tests, which do not reliably evaluate
color contrast.

### Footer-only accessibility statement link

The accessibility statement is legal and compliance-oriented content. Keeping it
in the footer Legal column follows common practice and avoids crowding primary
navigation.

### Self-assessment ACR

A third-party VPAT audit is out of scope for the initial delivery. The in-app ACR
documents measures, known limitations, and feedback channels honestly as a
self-assessment that can be updated after external review.

## Alternatives considered

| Alternative | Why not chosen |
| --- | --- |
| WCAG Level A only | Insufficient for a public product surface |
| ESLint only | Misses runtime markup and contrast issues |
| Playwright E2E a11y suite | Higher maintenance; Lighthouse + pa11y kept as local checks |
| PDF VPAT download | HTML ACR is easier to keep in sync with the app |

## Consequences

- UI contributors must follow `docs/accessibility.md`
- PR authors should run `npm run a11y:ci` locally when changing UI accessibility;
  it is not run in PR baseline CI due to runtime cost
- `eslint-plugin-jsx-a11y` uses an npm `overrides` entry for ESLint 10 until upstream peer support lands
- Home page CI scans may run against empty or error catalog states when registry fetch
  fails in CI; structural accessibility is still validated

## References

- [docs/accessibility.md](../accessibility.md)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [VPAT overview](https://www.itic.org/policy/accessibility/vpat)
