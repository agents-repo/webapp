# Testing Guide

This document describes how unit and accessibility tests are organized in the
webapp, what to test, and how to add new tests. It is the single source of truth
for testing conventions in this repository.

## References

These industry patterns inform our approach:

- [Vitest guide](https://vitest.dev/guide/) — co-located tests, `setupFiles`,
  explicit imports
- [Testing Library principles](https://testing-library.com/docs/guiding-principles)
  — test behavior users see
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
  — heavy static tests for pure logic; integration for hooks and components
- [TanStack Query testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
  — isolate state per test; mock at storage and network boundaries

This is a single-package Vite + React 19 SPA. We adopt patterns that fit that
scale, not monorepo ceremony.

## Commands

| Command | When to use |
| --- | --- |
| `npm run test` | Full suite — **same as PR baseline CI** |
| `npm run test:a11y` | UI or accessibility changes only — faster feedback |
| `npm run test:watch` | Local TDD while writing tests |
| `npm run test:e2e` | Playwright browser specs — **local only** |
| `npm run a11y:ci` | Post-build Lighthouse and pa11y scans — **local only** |

`npm run test` includes accessibility smoke tests (`*.a11y.test.tsx`). The
`test:a11y` script runs the same files via [`vitest.a11y.config.ts`](../vitest.a11y.config.ts)
(`include: **/*.a11y.test.tsx`) so the file glob stays stable on Vitest 4.x.

For dependency or router changes, also run `npm run test:e2e` locally (Playwright;
not part of PR baseline CI).

Optional local coverage (not enforced in CI):

```bash
npx vitest run --coverage
```

Install `@vitest/coverage-v8` if coverage reporting is needed locally.

## Testing trophy for this app

| Layer | What belongs here | Examples in this repo |
| --- | --- | --- |
| Static unit | Pure functions, validators, formatters | `registrySourceUrl`, selectors |
| Integration | Multi-module flows with mocked I/O | `registryRepository.cache.integration` |
| A11y smoke | Key UI surfaces via vitest-axe | `Header.a11y.test.tsx`, `HomePage.a11y.test.tsx` |
| E2E browser | Full user journeys in a real browser | Playwright specs in `e2e/` — see [e2e-testing.md](e2e-testing.md) |

Prefer static unit tests for logic that can run without rendering. Use
integration tests when several modules must cooperate. Reserve component tests
for behavior that depends on React lifecycle, routing, or user interaction.

## Test types and naming

| Pattern | Purpose |
| --- | --- |
| `*.test.ts` | Unit tests for pure logic or infrastructure |
| `*.integration.test.ts` | Multi-module flows with mocked fetch or storage |
| `*.a11y.test.tsx` | Component accessibility smoke tests (vitest-axe) |
| `e2e/*.spec.ts` | Playwright E2E browser tests (local only) |

Use `describe` / `it` with explicit imports from `vitest` (no globals).

## Where to put tests

Tests are **co-located** beside the code they exercise, mirroring the DDD module
layout (`application`, `infrastructure`, `presentation`).

```text
src/
├── test/                          # Shared test infrastructure
│   ├── setup.ts
│   ├── renderWithProviders.tsx
│   ├── testUtils.ts
│   └── fixtures/
│       └── sampleRegistryCatalog.ts
├── modules/
│   ├── registry/
│   │   ├── application/           # source + *.test.ts
│   │   └── infrastructure/        # source + *.test.ts
│   └── site/
│       └── presentation/
│           └── layout/            # source + *.a11y.test.tsx
```

Do **not** move Vitest tests to a top-level `tests/` folder. That would break
module boundaries documented in
[architecture/ddd-decision.md](architecture/ddd-decision.md).

Playwright E2E specs live in the top-level `e2e/` directory — that is the
intentional exception for browser tests. See [e2e-testing.md](e2e-testing.md).

The top-level `test/` directory holds `node:test` scripts that are not Vitest
suites:

| Pattern | Purpose |
| --- | --- |
| `test/*.test.mjs` | Repo tooling and build-config tests |
| `test/*.integration.test.mjs` | Post-build, read-only `dist/` crawl checks |

Build-artifact tests must not mutate `./dist`. Run `npm run build:pages` first,
then `npm run test:crawl-files`. Deploy workflows publish the same `dist/`
output; tests that rebuild into `./dist` would corrupt crawl files before
deploy.

When logic is trapped in private page helpers (for example inside `HomePage.tsx`),
extract it to a sibling module before testing.

## Fixture rules

| Location | When to use |
| --- | --- |
| `src/test/fixtures/` | Data reused across multiple modules or test files |
| Beside source | Single-consumer fixtures (e.g. `homePageTestFixtures.ts`) |

## Patterns

### Imports and structure

- Import `describe`, `it`, `expect`, `vi` from `vitest` explicitly.
- Follow Arrange-Act-Assert in each test.
- Prefer one behavior per `it` block.

### Mocks and isolation

- Vitest config sets `clearMocks: true` so mock state does not leak between tests.
- Mock fetch with `vi.spyOn(globalThis, 'fetch')` for infrastructure tests.
- For tests touching `localStorage`, call `clearTestStorage()` from
  `src/test/testUtils.ts` in `beforeEach` or `afterEach`.
- Use `resetRegistryCatalogCacheForTests()` when testing catalog cache behavior.

### Component and hook tests

- Use `renderWithProviders()` from `src/test/renderWithProviders.tsx` for
  components that need routing or theme context. Pass `initialEntries` when a
  specific starting route is required.
- Prefer `userEvent.setup()` over `fireEvent` for interactions.
- Query priority: role → label → text → test id (last resort).

### Date and locale assertions

Functions using `Intl` or `Date` may be timezone-sensitive. Pin time with
`vi.setSystemTime()` in tests, or assert structural patterns instead of
hard-coded locale strings.

### Accessibility tests

- File suffix: `.a11y.test.tsx`
- Use `axe()` from `vitest-axe` on the rendered container.
- Some tests disable `color-contrast` because jsdom does not evaluate contrast;
  real contrast is checked via `npm run a11y:ci`. See [accessibility.md](accessibility.md).

## Coverage map

### Well tested

| Area | Test files |
| --- | --- |
| Registry URLs and cache identity | `registrySourceUrl.test.ts` |
| Major-version refs and aliases | `registryMajorVersionRef.test.ts` |
| Tag resolution | `registryTagResolver.test.ts` |
| Source config | `registrySourceConfig.test.ts`, `resolve.test.ts`, `validateAlias.test.ts` |
| Catalog validation | `registryCatalogValidation.test.ts` |
| Catalog cache identity | `registryCatalogCache.test.ts` |
| Repository loading | `registryRepository.test.ts`, cache integration |
| Registry settings (localStorage) | `registrySourceSettings.test.ts` |
| Package search selectors | `registrySelectors.test.ts` |
| URL safety | `urlSafety.test.ts` |
| Site page meta | `sitePageMeta.test.ts` |
| SEO head builder and meta | `buildRouteHead.test.ts`, `siteSeoMeta.test.ts`, `SiteHead.test.tsx` |
| Theme mode persistence | `themeMode.test.ts` |
| PWA install helpers | `pwaInstall.test.ts` |
| External link accessible names | `externalLink.test.ts` |
| Key UI a11y smoke | `Header`, `HomePage`, `WebsiteSettingsControl`, `AccessibilityPage` |

### Prioritized backlog

Track implementation in GitHub issues. Suggested priority:

### Tier 1 — next unit test PRs

- [x] #57 — `themeMode.ts` — storage, `auto` mode, `matchMedia` resolution
- [x] #58 — `validateRegistrySourceUrlForMajorVersionAlias` — settings save validation
- [x] #59 — `registryCatalogCache.ts` — TTL expiry, LRU eviction, `touchCatalogCache`
- [x] #60 — `getRegistryBaseUrlFromIndexUrl` — inverse URL helper

### Tier 2 — extract then test

- [x] #66 — `HomePage.tsx` — extract `homePageCatalogState.ts` for status helpers
- [x] #66 — `WebsiteSettingsControl.tsx` — integration tests with mocked `registrySource`
- [x] #66 — `formatDocumentTitle` in `useDocumentTitle.ts`

### Tier 3 — hooks and edge cases

- [x] #67 — `usePwaInstall` — RTL with mocked `beforeinstallprompt` events
- [x] #67 — `RouteAnnouncer` — live region and focus behavior (`renderWithProviders` `initialEntries`)
- [x] #67 — `registryCatalogValidation.ts` — additional rejection cases
- [x] #67 — `registryTagResolver.ts` — GitHub `Link` header pagination

## When not to test

Skip unit tests for:

- Static marketing or content pages (`AboutPage`, `ContactPage`, `HelpUsPage`)
- Trivial label maps (`installTargets.ts`)
- Type-only modules (`registryCatalogStatusNote.ts`)
- Thin layout wrappers that delegate to tested logic (`Footer`, `ThemeModeDropdown`)

## Future options (not adopted)

These may be reconsidered if the test suite grows significantly:

- MSW for fetch mocking (current `vi.spyOn` on `fetch` is sufficient today)
- Vitest projects split (`test:unit` / `test:integration`)
- CI coverage gates
- Playwright E2E in GitHub Actions (currently local-only; see [e2e-testing.md](e2e-testing.md))

Trigger for Vitest projects split: integration suite noticeably slows PR feedback.

## Validation before PR

When adding or changing tests, run:

```bash
npm run lint:all
npm run test
npm run typecheck
```

For UI changes, also run `npm run test:a11y` and, when changing flows or
routing, `npm run test:e2e` (local only — see [e2e-testing.md](e2e-testing.md)).
