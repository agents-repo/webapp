# Architecture

High-level map of the webapp codebase. Module boundaries and rules are defined
in [architecture/ddd-decision.md](architecture/ddd-decision.md). Product and
UI behavior details live in [development.md](development.md#current-ui-state).

## Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| `registry` | `src/modules/registry/` | Catalog fetch/cache, package pages, download stats |
| `site` | `src/modules/site/` | App shell, routing, docs pages, settings, accessibility helpers |

## Entry points

| Area | Path |
| --- | --- |
| App bootstrap | `src/main.tsx`, `src/App.tsx` |
| Site routes | `src/modules/site/presentation/routes/siteRoutes.tsx` |
| Registry routes | `src/modules/registry/presentation/` (package list/detail) |
| Global styles | `src/index.scss`, `src/App.scss`, `src/styles/bootstrap-theme.scss` |
| SEO / Pages build | `scripts/build-pages.mjs`, `vite.config.ts` |

## Layering (per module)

```text
presentation/  → React components, routes
application/   → hooks, orchestration, selectors
domain/        → types, pure rules
infrastructure/→ fetch adapters, IndexedDB, external APIs
```

## Decision records

- [architecture/ddd-decision.md](architecture/ddd-decision.md) — module boundaries
- [architecture/accessibility-decision.md](architecture/accessibility-decision.md) — WCAG enforcement
- [styling-and-technology.md](styling-and-technology.md) — stack and styling model

## Related docs

- [development.md](development.md) — toolchain, validation, UI state
- [testing.md](testing.md) — Vitest, a11y smoke, E2E policy
- [e2e-testing.md](e2e-testing.md) — Playwright setup
- [accessibility.md](accessibility.md) — contributor a11y patterns
