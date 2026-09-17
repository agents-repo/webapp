---
applyTo: "scripts/og/**,scripts/og-image.mjs"
description: "Open Graph JPEG templates (Satori/sharp); not part of build:pages."
---

# OG image templates

- After any change under `scripts/og/` or `scripts/og-image.mjs`, run
  `npm run og:generate` and **commit** all artifacts it updates:
  `public/og-image.jpg`, `public/og-image.src.sha256`, and everything under
  `public/og/` (route JPEGs and `routes.src.sha256`).
- PR baseline runs `npm run og:check` when OG paths change; fingerprint-only
  updates are required even when JPEG output is unchanged.
- See [docs/seo.md](../../docs/seo.md) for dimensions and drift checks.
