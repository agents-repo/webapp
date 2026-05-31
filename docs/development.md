# Development Workflow

## Toolchain

This project follows the pinned runtime declared in `.nvmrc` and `package.json`.
Use Corepack when possible so local npm matches CI.

```bash
corepack enable
corepack prepare npm@11.12.1 --activate
npm install
```

## Local Validation

Run these checks before opening a pull request:

```bash
npm run env:check
npm run lint:all
npm run typecheck
npm run build
```

Pre-commit hooks run `npm run lint:all` automatically through Husky.

## Project Layout

- `src/` contains the React application
- `public/` contains static assets served directly by Vite
- `docs/` contains contributor-facing documentation
- `docs/architecture/` contains architecture decision records, including the DDD boundary note
- `.github/` contains AI guidance, issue templates, and workflows
- `.vscode/` contains recommended workspace defaults

## Styling

- App styling is authored in SCSS only.
- `src/styles/bootstrap-theme.scss` is the canonical Bootstrap customization entrypoint.
- `src/index.scss` and `src/App.scss` hold the base app styles.
- Do not add new `.css` entrypoints for application styling.
- Prefer global, reusable Bootstrap Sass variables and theme tokens before
   introducing custom classes.
- Use custom classes only when the requirement cannot be represented with
   Bootstrap variables, shared utilities, or component-level props.

## Current UI State

- The landing page currently renders registry package cards from local mock data in
   `src/modules/registry/infrastructure/mockRegistryRepository.ts`.
- Search is client-side only and transitions from hero to sticky header on scroll.
- The shared header uses a mobile-first navbar: below `md` navigation is
   collapsed behind a hamburger toggle.
- Sticky header search is hidden below `md`; from `md` upward it appears in
   the middle region while brand stays left and page links stay right.
- API fetching is intentionally deferred until a follow-up integration task.
- The styling and architecture decisions are documented in `docs/styling-and-technology.md`
   and `docs/architecture/ddd-decision.md`.

## Pull Requests

Use the pull request template in `.github/pull_request_template.md`.
Keep changes scoped and document any UI or workflow impact clearly.

Before opening a PR:

1. Create an issue from the matching form in `.github/ISSUE_TEMPLATE/`.
2. Choose the matching category: bug/inconsistency, spec change, feature
   proposal, or task/chore.
3. Documentation-only work uses the task/chore issue category and the `docs/`
   branch prefix.
4. Create a non-`main` branch from the latest `main` using
   `<prefix>/<issue-number>-<slug>`.
5. Use the prefix that matches the work category:

   - `fix/` for bug or inconsistency
   - `spec/` for spec change
   - `feat/` for feature proposal
   - `chore/` for task or chore
   - `docs/` for documentation-only work

6. In `## Related Issues`, include `Closes #<issue-number>`.
7. Every PR targeting `main` must close a tracking issue.
