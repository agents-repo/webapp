---
title: How the registry works
description: Catalog index, package metadata, version manifests, ZIP artifacts, and how webapp and CLI fetch data.
order: 50
section: Registry
---

The [registry](https://github.com/agents-repo/registry) repository is the **source of truth** for package definitions. Runtime logic stays out of the catalog; consumers read files over HTTP.

## Package identity

- **Package id**: `namespace/package-id` (lowercase kebab-case segments).
- **Source tree**: `packages/<namespace>/<package-id>/` in the registry repo.
- **Version artifacts**: semver ZIPs under `versions/` with checksums in `versions/manifest.json`.

## Catalog files

| File | Role |
| --- | --- |
| `packages/index.json` | Lists packages and latest versions for browsing |
| `metadata.json` | Package-level metadata (description, targets, license) |
| `versions/manifest.json` | Per-version artifact URLs and SHA-256 checksums |

Consumers resolve a **git ref** (for example `v2.x` or a release tag), then fetch index and per-package files for that ref.

## registry-proxy

Production webapp and many CLI setups use [registry-proxy](https://github.com/agents-repo/registry-proxy) to cache GitHub Raw/contents responses. You can still link to the registry tree on GitHub for human review.

## Webapp vs CLI

- **Webapp**: loads the index for search/UI; offers in-app package pages, Use in chat, downloads, and GitHub browse on the detail page ([Using the catalog](/docs/using-the-catalog)).
- **CLI**: resolves versions, verifies ZIP integrity, and extracts into install target paths ([Installing packages](/docs/installing-packages)).

Normative formats live in [registry specs](https://github.com/agents-repo/registry/tree/main/specs). This guide does not duplicate spec text.
