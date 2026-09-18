/**
 * Package catalog OG (phase 3) — build-time only. Template basenames for
 * `packages.template.sha256` drift checks (no committed per-package JPEGs).
 */
export const PACKAGE_CATALOG_OG_TEMPLATE_BASENAMES = [
  'constants.mjs',
  'render-lib.mjs',
  'route-card-layout.mjs',
  'package-detail-card.mjs',
  'render-package-og.mjs',
  'package-og-catalog.mjs',
  'package-og-inputs.mjs',
]

/** Package-catalog OG build entrypoints (paths that affect dist JPEG generation; PR baseline `pages`/`og` via `scripts/ci-pr-path-filters.mjs`). */
export const PACKAGE_CATALOG_OG_BUILD_PATH_PREFIXES = [
  'scripts/generate-package-og-dist.mjs',
  'scripts/og/package-detail-card.mjs',
  'scripts/og/render-package-og.mjs',
  'scripts/og/package-og-inputs.mjs',
  'scripts/og/package-og-catalog.mjs',
]

export const PACKAGE_CATALOG_OG_TEMPLATE_FINGERPRINT_FILE = 'packages.template.sha256'
