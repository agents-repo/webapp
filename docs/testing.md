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
| `npm run a11y:ci` | Post-build Lighthouse and pa11y scans — **local only** |

`npm run test` includes accessibility smoke tests (`*.a11y.test.tsx`). The
`test:a11y` script is a filter for contributors working on UI surfaces.

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
| E2E browser | Full user journeys | Not present today |

Prefer static unit tests for logic that can run without rendering. Use
integration tests when several modules must cooperate. Reserve component tests
for behavior that depends on React lifecycle, routing, or user interaction.

## Test types and naming

| Pattern | Purpose |
| --- | --- |
| `*.test.ts` | Unit tests for pure logic or infrastructure |
| `*.integration.test.ts` | Multi-module flows with mocked fetch or storage |
| `*.a11y.test.tsx` | Component accessibility smoke tests (vitest-axe) |

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

Do **not** move tests to a top-level `tests/` folder. That would break module
boundaries documented in [architecture/ddd-decision.md](architecture/ddd-decision.md).

When logic is trapped in private page helpers (for example inside `HomePage.tsx`),
extract it to a sibling module before testing.

## Fixture rules

| Location | When to use |
| --- | --- |
| `src/test/fixtures/` | Data reused across multiple modules or test files |
| Beside source | Single-consumer fixtures (e.g. `homePageA11yTestFixtures.ts`) |

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
  components that need routing or theme context.
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
- [ ] #60 — `getRegistryBaseUrlFromIndexUrl` — inverse URL helper

### Tier 2 — extract then test

- [ ] `HomePage.tsx` — extract `homePageCatalogState.ts` for status helpers
- [ ] `WebsiteSettingsControl.tsx` — integration tests with mocked `registrySource`
- [ ] `formatDocumentTitle` in `useDocumentTitle.ts`

### Tier 3 — hooks and edge cases

- [ ] `usePwaInstall` — RTL with mocked `beforeinstallprompt` events
- [ ] `RouteAnnouncer` — live region and focus behavior (extend
  `renderWithProviders` with `initialEntries`)
- [ ] `registryCatalogValidation.ts` — additional rejection cases
- [ ] `registryTagResolver.ts` — GitHub `Link` header pagination

## When not to test

Skip unit tests for:

- Static marketing or content pages (`AboutPage`, `ContactPage`, `HelpUsPage`)
- Trivial label maps (`installTargets.ts`)
- Type-only modules (`registryCatalogStatusNote.ts`)
- Thin layout wrappers that delegate to tested logic (`Footer`, `ThemeModeDropdown`)

## Future options (not adopted)

These may be reconsidered if the test suite grows significantly:

- Top-level `tests/` mirror tree
- MSW for fetch mocking (current `vi.spyOn` on `fetch` is sufficient today)
- Vitest projects split (`test:unit` / `test:integration`)
- CI coverage gates

Trigger for Vitest projects split: integration suite noticeably slows PR feedback.

## Validation before PR

When adding or changing tests, run:

```bash
npm run lint:all
npm run test
npm run typecheck
```

For UI changes, also run `npm run test:a11y`.
