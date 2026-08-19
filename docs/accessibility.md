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
| `RouteDocumentTitle.tsx` | Sets `document.title` on pathname change for all routes |
| `useDocumentTitle.ts` | Optional title helper for isolated views or tests |
| `sitePageMeta.ts` | Route titles and announcement labels |
| `externalLink.ts` | Any `target="_blank"` link needs a new-tab cue |
| `accessibilityStatementContent.ts` | Source copy for the public ACR page |

### Page requirements

Every routed page should:

1. Rely on `RouteDocumentTitle` in `src/App.tsx` for the browser tab title (do not
   call `useDocumentTitle` in page components unless the view is rendered outside
   the app shell).
2. Render page content inside the app-shell `main#main-content` provided by
   `src/App.tsx` (page components use a wrapper `div`, not their own `main`).
3. Use semantic headings in order (`h1` once per page)
4. Mark decorative icons with `aria-hidden="true"`
5. Label icon-only controls with `aria-label`. Package card footer actions
   are a hybrid: they keep a short visible label (CLI, Use in chat, Download,
   View) that stays visible below Bootstrap `md`. From `md` up they collapse
   until hover, keyboard focus (`:focus-visible`), or `aria-expanded`. When
   `aria-label` also includes the package name, the visible label must be a
   contiguous prefix of that name (WCAG 2.5.3 Label in Name), for example
   `Use in chat for {name}`.
6. Use `externalLinkAccessibleName()` for links that open in a new tab

### Forms

- Associate every input with a visible or visually hidden `Form.Label`
- Prefer one `<form>` per modal or page section so Enter submits predictably
- Surface validation errors with `isInvalid` and `Form.Control.Feedback`

### Dynamic content

- Announce search or filter result changes with `aria-live="polite"`
- Use `aria-busy` while async actions such as PWA install are in progress
- Use `<output>` for status messages (copy confirmation, loading) instead of
  `role="status"`. `<output>` has an implicit status role and is more reliable
  across assistive technologies and devices.
- Keep popovers inside the viewport. Prefer Popper `flip` and a max-height with
  scrolling so interactive content is not clipped by the window edge.

### Package README mermaid diagrams

Fenced `mermaid` blocks in package README and accordion instruction markdown
render through `PackageMarkdown` as images (not as inline SVG):

- Loading uses `<output>` with visually hidden “Loading diagram” and an
  `aria-hidden` spinner
- Success uses `<img alt="Mermaid diagram">` plus a visually hidden source
  description
- Render failure restores the original `<pre><code class="language-mermaid">`
  fence

Site docs (`DocMarkdown`) do not render mermaid. Fence language `flowchart`
stays a plain code block.

### Package markdown tables

YAML frontmatter and GFM pipe tables in `PackageMarkdown` use HTML `<table>`
markup:

- Mapping keys use `<th scope="row">`
- Nested arrays of objects use `<th scope="col">` for column headers
- Nested arrays of primitives use a single `<th scope="col">Value</th>` column header
- Nested tables are allowed so `inputs` and `outputs` stay structured

Site docs keep GFM tables only; they do not display YAML frontmatter as a
table.

### Cookie consent banner

The analytics consent banner (`CookieConsentBanner.tsx`) must:

- Use `role="region"` with `aria-labelledby` pointing at the banner heading
- Link to both `/privacy` and `/privacidade` before Accept/Reject controls
- Present Accept and Reject with equal visual prominence (same button variant
  and sizing)
- Stay visible until the user makes an explicit choice (no dismiss-without-choice)
- Re-open from footer **Cookie preferences** via `openCookiePreferences()`

Privacy policy pages (`PrivacyPage`, `PrivacidadePage`) follow the same page
requirements as other public routes: one `h1`, semantic `main`, document title,
and accessible tables for the cookie/storage section.

### Motion and theme

- Wrap non-essential transitions in `@media (prefers-reduced-motion: no-preference)`
- Keep `theme-color` meta in sync when the applied Bootstrap theme changes
- Dark-mode purple-on-dark text (links, outline buttons, always-dark header
  current page) uses a 70% tint of `$primary` defined in
  `src/styles/bootstrap-theme.scss`. Do not paint those surfaces with
  untinted `--bs-primary`. Token-level contrast is asserted in
  `test/dark-mode-contrast.test.mjs`; rendered contrast is checked with
  `npm run a11y:ci`.

## Validation commands

Run before marking the pull request ready for review:

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
| `npm run test:a11y` | Vitest + axe smoke tests (`*.a11y.test.tsx` via `vitest.a11y.config.ts`) |
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
- [ ] Package card footer action `aria-label`s contain the visible label as a
  contiguous prefix when the name also includes the package
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
