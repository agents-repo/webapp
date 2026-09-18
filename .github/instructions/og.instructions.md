---
applyTo: "scripts/og/**,scripts/og-image.mjs,scripts/generate-package-og-dist.mjs,src/assets/logo/agents-repo-logo.svg"
description: "Open Graph JPEG templates (Satori/sharp); pages OG commit-first; catalog OG at build:pages."
---

# OG image templates

**Pages OG (phases 1–2):** After changes to pages card templates, `scripts/og-image.mjs`, or
`src/assets/logo/agents-repo-logo.svg`, run `npm run og:generate` and **commit**
`public/og-image.jpg`, `public/og-image.src.sha256`, route JPEGs under `public/og/`,
`routes.src.sha256`, and `packages.template.sha256` (catalog template sources: card
scripts in `scripts/og/` plus the brand logo, via `hashFiles()` in `scripts/og-image.mjs`).

**Package catalog OG (phase 3):** Per-package detail JPEGs are **not** committed. They are
generated during `npm run build:pages` into `dist/og/packages/…`. Do not expect
`og:generate` to write catalog JPEGs.

- PR baseline runs `npm run og:check` when OG paths change.
- See [docs/seo.md](../../docs/seo.md) for the two-pipeline policy and dimensions.
