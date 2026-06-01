# Architecture and DDD Decision

## Decision

Use a modular, DDD-inspired layout under `src/modules/` with feature-centric
boundaries. Each module should keep domain, application, infrastructure, and
presentation concerns separated when those layers are useful for the feature.

## Current Module Boundaries

- `src/modules/registry/` owns registry package data, selectors, repository
  adapters, and the landing page.
- `src/modules/site/` owns the shared site shell, routes, and generic site
  pages.

## Rules

- Keep cross-module imports narrow and intentional.
- Put data access adapters in infrastructure, business rules in domain or
  application, and UI concerns in presentation.
- Keep cache adapters and remote-fetch fallback policies in infrastructure so
  presentation and application layers consume a stable loading contract.
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
