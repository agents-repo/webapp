# Architecture and DDD Decision

## Decision

Use a modular, DDD-inspired layout under `src/modules/` with feature-centric
boundaries. Each module should keep domain, application, infrastructure, and
presentation concerns separated when those layers are useful for the feature.

## Current Module Boundaries

- `src/modules/registry/` owns registry package data, selectors, repository
  adapters, the landing catalog, and in-app package index and detail pages
  (`/packages`, `/packages/:namespace`, `/packages/:namespace/:packageId`).
- `src/modules/site/` owns the shared site shell, routes, and generic site
  pages. Package SEO helpers in `site` read the runtime catalog snapshot from
  the registry module.

## Rules

- Keep cross-module imports narrow and intentional.
- Put data access adapters in infrastructure, business rules in domain or
  application, and UI concerns in presentation.
- Keep cache adapters and remote-fetch fallback policies in infrastructure so
  presentation and application layers consume a stable loading contract.
- Shared persistent LRU and abort helpers for registry caches and fetches live
  in registry infrastructure (`persistentLruCache.ts`, `indexedDbCacheBackend.ts`,
  `callerAbort.ts`). IndexedDB access stays in that backend; presentation must
  not import `idb`. Do not promote these helpers to a cross-module global.
- Prefer local module composition over creating shared globals for feature-specific behavior.
- When a module grows, split it by responsibility before duplicating logic elsewhere.

## Why This Decision Exists

The registry app is small enough to stay readable, but it already benefits
from explicit boundaries. This structure keeps the codebase approachable for
AI-assisted changes because each folder has a clear responsibility and a
predictable place for new code.

## Related Docs

- [Styling and technology decisions](../styling-and-technology.md)
- [Development workflow](../development.md)
