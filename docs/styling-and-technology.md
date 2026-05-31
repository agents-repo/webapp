# Styling and Technology Decisions

## Stack

The webapp is a Vite + React + TypeScript frontend. It uses Bootstrap and
React Bootstrap for UI primitives, React Router for page navigation, Sass for
authored styles, ESLint for code linting, and markdownlint for documentation
checks.

## Styling Policy

- Authored application styles must use SCSS.
- Do not introduce new `.css` files for app behavior or layout.
- `src/styles/bootstrap-theme.scss` is the canonical Bootstrap customization entrypoint.
- `src/index.scss` owns base document-level styles.
- `src/App.scss` owns app-shell and shared page chrome styles.

## Current State

The current UI is intentionally mock-data-first. The registry landing page
renders local package data while API fetching remains deferred to a later
integration task.

## Why This Split Exists

This split keeps Bootstrap customization centralized and makes the right
styling surface easier to find. It also keeps app shell styling separate from
Bootstrap variables, which reduces the risk of regressions when theme tokens
change.

## Related Docs

- [Development workflow](../development.md)
- [AI collaboration guidance](../ai-collaboration.md)
- [Architecture and DDD decision](architecture/ddd-decision.md)
