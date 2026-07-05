# E2E Testing Guide

This document describes Playwright browser tests for the webapp: when to use
them, how to run them locally, and how to add new specs.

E2E tests are **local-only** — they are not run in PR baseline CI (same policy
as `npm run a11y:ci`). Vitest unit and a11y smoke tests remain the automated
CI gate.

See also [testing.md](testing.md) for Vitest conventions.

## When to write E2E vs Vitest

| Layer | Tool | CI | Use for |
| --- | --- | --- | --- |
| Static unit | Vitest | Yes | Pure logic, validators, formatters |
| Integration | Vitest | Yes | Multi-module flows with mocked fetch/storage |
| A11y smoke | Vitest + vitest-axe | Yes | Key UI surfaces in jsdom |
| E2E browser | Playwright | **No (local)** | Full routing, real DOM, modal flows, persistence |

Add Playwright coverage when behavior depends on the full browser pipeline
(routing shell, Bootstrap dropdowns, `localStorage` across reloads, network
mocking at the page boundary). Keep logic in Vitest when possible.

## First-time setup

Playwright is installed as a dev dependency, but browser binaries are not:

```bash
npm install
npx playwright install chromium
```

Without the browser install step, `npm run test:e2e` fails with an executable
not found error.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run test:e2e` | Run all specs (builds via `webServer`, serves on port 4173) |
| `npm run test:e2e:ui` | Interactive UI mode for debugging |
| `npm run test:e2e:report` | Open the HTML report from the last run |

`test:e2e` runs `build:pages:e2e` internally, which uses `vite --mode e2e` and
loads [`.env.e2e`](../.env.e2e) for alias-free registry URLs.

Do **not** run `npm run test:e2e` and `npm run a11y:ci` at the same time — both
use port 4173. `reuseExistingServer` in `playwright.config.ts` reuses an
existing preview when one is already running.

## Directory layout

```text
e2e/
├── fixtures/
│   ├── catalog.ts          # Typed catalog JSON (mirrors src/test/fixtures shape)
│   ├── registry-mock.ts    # page.route helpers + extended test fixture
│   └── storage.ts          # localStorage/sessionStorage isolation
├── home-catalog.spec.ts
├── home-search.spec.ts
├── navigation.spec.ts
├── cookie-consent.spec.ts
├── theme-mode.spec.ts
├── website-settings.spec.ts
└── catalog-error.spec.ts
playwright.config.ts
.env.e2e.example
```

Vitest tests stay co-located under `src/`. The top-level `e2e/` directory is the
**Playwright exception** to that rule — not a Vitest `tests/` mirror.

## Registry mocking contract

The production default registry URL uses a `v2.x` alias that triggers GitHub tag
resolution. E2E builds avoid this by setting alias-free URLs in `.env.e2e`:

```env
VITE_REGISTRY_BASE_URL=https://e2e.local/registry
VITE_REGISTRY_GITHUB_REPOSITORY_URL=https://github.com/agents-repo/registry/tree/main
VITE_REGISTRY_INDEX_PATH=packages/index.json
```

Specs mock the resolved index URL with `page.route`, matching the **full URL**
(not pathname alone — multiple hosts can share `/packages/index.json`):

```ts
import { test, expect } from './fixtures/registry-mock'

test('example', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'sample-agent', level: 3 })).toBeVisible()
})
```

Use `mockRegistryIndex(page, catalog, indexUrl)` when a spec needs a custom
index URL (for example website settings override tests).

Clear browser storage for persistence specs via `clearBrowserStorage(page)` in
`beforeEach`. It clears on the first navigation only and skips later reloads.
Relevant keys: `theme`, `registry.source.baseUrlOverride`,
`registry.catalog.cache.v1`, `analytics-consent`.

### Analytics consent in E2E

E2E builds use `vite build --mode e2e` (`MODE=e2e`). Analytics and GTM are
disabled by the `isProductionAnalyticsEnabled()` guard even when
`import.meta.env.PROD` is `true`.

The shared storage fixture pre-seeds `analytics-consent: rejected` so the
cookie banner does not block unrelated specs. Cookie consent behavior is
covered in `e2e/cookie-consent.spec.ts`. Do not assert `gtm.js` network loads
in Playwright — use unit tests for GTM injection logic instead.

## Writing a new spec

1. Prefer `test` from `e2e/fixtures/registry-mock.ts` when the home catalog
   must load mocked packages.
2. Query priority: role → label → text (no new `data-testid` unless necessary).
3. Bootstrap dropdowns: click the toggle first, then the menu item.
4. One behavior per `test` block; follow Arrange-Act-Assert.
5. Run `npm run test:e2e` locally before opening a PR that touches UI flows.

### Checklist

- [ ] Registry index mocked at the correct full URL
- [ ] `localStorage` cleared when testing theme or settings persistence
- [ ] Assertions use visible headings/labels, not `document.title` metadata
- [ ] Spec file named `*.spec.ts` under `e2e/`

## Debugging failures

- **HTML report:** `npm run test:e2e:report` after a failed run
- **UI mode:** `npm run test:e2e:ui` for step-through debugging
- **Traces:** retained on failure (`trace: 'retain-on-failure'` in config)
- **Screenshots:** captured on failure in `test-results/`

## Local-only policy

| Layer | PR baseline CI | Local contributor |
| --- | --- | --- |
| Vitest unit + a11y smoke | Yes (`npm run test`) | Yes |
| Playwright E2E | **No** | Yes (`npm run test:e2e`) |
| Lighthouse + pa11y | **No** | Yes (`npm run a11y:ci`) |

Run `npm run test:e2e` when changing UI flows, routing, or registry
integration. It is recommended but not a required CI gate. Future CI adoption
can be tracked as a separate issue.

## E2E backlog (deferred)

| Scenario | Reason to defer |
| --- | --- |
| PWA install button visibility | Requires `beforeinstallprompt`; unit tests cover `usePwaInstall` |
| Sticky header search on scroll | Scroll timing + viewport coupling |
| Mobile navbar collapse | Add later with a mobile viewport project |
| GitHub Pages `404.html` deep links | Needs `build:pages` + `serve` parity |
| Live registry proxy smoke | External dependency; not suitable for deterministic E2E |
| Multi-browser matrix (Firefox, WebKit) | Chromium-only is sufficient for local smoke today |
| GitHub Actions CI integration | Out of scope; local-only by design |
