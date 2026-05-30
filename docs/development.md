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
- `.github/` contains AI guidance, issue templates, and workflows
- `.vscode/` contains recommended workspace defaults

## Pull Requests

Use the pull request template in `.github/pull_request_template.md`.
Keep changes scoped and document any UI or workflow impact clearly.

Before opening a PR:

1. Create an issue from the matching form in `.github/ISSUE_TEMPLATE/`.
2. Create a non-`main` branch from the latest `main`.
3. In `## Related Issues`, include `Closes #<issue-number>` for issue-linked
   work.
4. If no tracking issue exists, include a short rationale in
   `## Related Issues`.
