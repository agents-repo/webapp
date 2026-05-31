# Styling and Technology Decisions

## Stack

The webapp is a Vite + React + TypeScript frontend. It uses Bootstrap and
React Bootstrap for UI primitives, Font Awesome React for iconography, React
Router for page navigation, Sass for authored styles, ESLint (including
SonarJS rules, selected security checks, and type-aware TypeScript analysis)
for code linting, and markdownlint for documentation checks.

## Styling Policy

- Authored application styles must use SCSS.
- Do not introduce new `.css` files for app behavior or layout.
- `src/styles/bootstrap-theme.scss` is the canonical Bootstrap customization entrypoint.
- `src/index.scss` owns base document-level styles.
- `src/App.scss` owns app-shell and shared page chrome styles.
- Prefer global, reusable Bootstrap Sass variables and theme tokens before
  creating custom classes.
- Use custom classes only when the requirement cannot be expressed through
  Bootstrap variables, shared utilities, or component props.
- When a Bootstrap token exists, define it in
  `src/styles/bootstrap-theme.scss` instead of adding one-off style overrides
  in page or shell styles.

## Current State

The current UI is intentionally mock-data-first. The registry landing page
renders local package data while API fetching remains deferred to a later
integration task.

The app currently uses Font Awesome React components for navigation and status
icons instead of introducing a separate in-house icon system.

## Why This Split Exists

This split keeps Bootstrap customization centralized and makes the right
styling surface easier to find. It also keeps app shell styling separate from
Bootstrap variables, which reduces the risk of regressions when theme tokens
change.

## Related Docs

- [Development workflow](development.md)
- [AI collaboration guidance](ai-collaboration.md)
- [Architecture and DDD decision](architecture/ddd-decision.md)
