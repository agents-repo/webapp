# Accessibility

This document describes accessibility expectations, shared patterns, and validation
commands for the Agents Repo webapp.

## Target

The webapp targets **WCAG 2.2 Level AA** conformance. The public statement and
VPAT-style Accessibility Conformance Report (ACR) live at `/accessibility`.

## Shared patterns

Reusable helpers live in `src/modules/site/application/accessibility/`:

| Module | Use when |
| --- | --- |
| `SkipLink.tsx` | App shell; first keyboard focus target |
| `RouteAnnouncer.tsx` | Announces route changes and focuses `#main-content` |
| `useDocumentTitle.ts` | Every page route needs a unique document title |
| `sitePageMeta.ts` | Route titles and announcement labels |
| `externalLink.ts` | Any `target="_blank"` link needs a new-tab cue |
| `accessibilityStatementContent.ts` | Source copy for the public ACR page |

### Page requirements

Every routed page should:

1. Call `useDocumentTitle(sitePageMeta[siteRoutes.<route>].title)`
2. Render `<main id="main-content" tabIndex={-1}>`
3. Use semantic headings in order (`h1` once per page)
4. Mark decorative icons with `aria-hidden="true"`
5. Label icon-only controls with `aria-label`
6. Use `externalLinkAccessibleName()` for links that open in a new tab

### Forms

- Associate every input with a visible or visually hidden `Form.Label`
- Prefer one `<form>` per modal or page section so Enter submits predictably
- Surface validation errors with `isInvalid` and `Form.Control.Feedback`

### Dynamic content

- Announce search or filter result changes with `aria-live="polite"`
- Use `aria-busy` while async actions such as PWA install are in progress

### Motion and theme

- Wrap non-essential transitions in `@media (prefers-reduced-motion: no-preference)`
- Keep `theme-color` meta in sync when the applied Bootstrap theme changes

## Validation commands

Run before opening or updating a pull request:

```bash
npm run lint:all
npm run test
npm run test:a11y
npm run typecheck
npm run build:pages
npm run a11y:ci
```

| Command | Purpose |
| --- | --- |
| `npm run lint` | Includes `eslint-plugin-jsx-a11y` recommended rules |
| `npm run test:a11y` | Vitest + axe smoke tests on key UI surfaces |
| `npm run a11y:ci` | Lighthouse (min 0.9) + pa11y WCAG2AA on built `dist/` (local only) |

Run `npm run a11y:ci` after `build:pages` when validating accessibility changes
locally. It is not part of PR baseline CI due to runtime cost.

On Linux (including Linux Mint), `pa11y-ci` uses Puppeteer and needs a Chrome
or Chromium binary. `npm run a11y:ci` auto-detects common paths such as
`/usr/bin/google-chrome-stable`. To override, set `PUPPETEER_EXECUTABLE_PATH`
or `CHROME_PATH` before running the command.

## Pull request checklist

When changing UI:

- [ ] Keyboard navigation still works (skip link, header, main, footer)
- [ ] New external links use `externalLinkAccessibleName()`
- [ ] New icon-only controls have accessible names
- [ ] Forms have associated labels
- [ ] `npm run test:a11y` passes
- [ ] Docs updated if patterns or validation changed

## Known limitations

See the public `/accessibility` page and
`docs/architecture/accessibility-decision.md` for scope, CI trade-offs, and
intentional exceptions.

## Related docs

- [accessibility-decision.md](architecture/accessibility-decision.md)
- [development.md](development.md)
- [seo.md](seo.md) — search and social-preview metadata (additive to this guide)
