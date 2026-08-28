# Architecture

High-level map of the webapp codebase. Module boundaries and rules are defined
in [architecture/ddd-decision.md](architecture/ddd-decision.md). Product and
UI behavior details live in [development.md](development.md#current-ui-state).

## Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| `registry` | `src/modules/registry/` | Catalog fetch/cache, package pages, download stats |
| `site` | `src/modules/site/` | Shell, docs, settings, and site route helpers |

`src/App.tsx` composes React Router for both modules: site pages use lazy-loaded
components from `site`; package list and detail routes mount registry page
components. Package paths (`/packages/*`) are defined in `siteRoutes.ts` but
wired in `App.tsx`, not in a registry routes module.

## Entry points

| Area | Path |
| --- | --- |
| App bootstrap | `src/main.tsx`, `src/App.tsx` |
| Site route constants | `src/modules/site/presentation/routes/siteRoutes.ts` |
| Registry pages | `src/modules/registry/presentation/pages/` |
| Global styles | `src/index.scss`, `src/App.scss`, `src/styles/bootstrap-theme.scss` |
| SEO / Pages build | `scripts/prepare-pages-dist.mjs`, `vite.config.ts` |

## Layering (per module)

`registry` uses all four layers. `site` has `application/` and `presentation/`
only (no `domain/` or `infrastructure/` folders).

```text
presentation/  → React components, page modules
application/   → hooks, orchestration, selectors, pure helpers
domain/        → types, pure rules (registry only today)
infrastructure/→ fetch adapters, IndexedDB, external APIs (registry only today)
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
