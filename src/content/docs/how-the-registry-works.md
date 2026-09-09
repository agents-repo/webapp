---
title: How the registry works
description: Catalog index, package detail.json, version manifests, ZIP artifacts, and how webapp and CLI fetch data.
order: 50
section: Registry
---

The [registry](https://github.com/agents-repo/registry) repository is the **source of truth** for package definitions. Runtime logic stays out of the catalog; consumers read files over HTTP.

## Package identity

- **Package id**: `namespace/package-id` (lowercase kebab-case segments).
- **Source tree**: `packages/<namespace>/<package-id>/` in the registry repo.
- **Version artifacts**: semver ZIPs under `versions/` with checksums in `versions/manifest.json`. When a package has a root `README.md` at release, `package:build` copies it to `versions/<version>/README.md`.

## Catalog files

| File | Role |
| --- | --- |
| `packages/index.json` | Lists packages and latest versions for browsing |
| `packages/<namespace>/<package-id>/detail.json` | Generated latest-snapshot aggregate for in-app package pages (optional `readmeMarkdown` from `versions/<latest>/README.md`) |
| `metadata.json` | Package-level metadata (description, targets, license) |
| `versions/manifest.json` | Per-version artifact URLs and SHA-256 checksums |

Consumers resolve a **git ref** (for example `v2.x` or a release tag), then fetch index and per-package files for that ref. Contributors MUST NOT author `detail.json`.

## Registry distribution tags vs package versions

Two versioning layers apply:

- **Registry Git tags** (for example `v2.0.1`) version the **catalog snapshot** consumed via refs like `v2.x`.
- **Package versions** in `versions/manifest.json` `latest` version individual package compatibility. These layers are independent.

Package squash-merge titles (`feat(package):`, `fix(package):`) classify package intent for history and CI. They do **not** publish a catalog registry tag immediately.

### Catalog release train

Registry **catalog** Git tags for `v2.x` consumers publish on a daily schedule when `packages/` has unreleased changes since the latest `v*` tag:

- **Schedule:** daily at **00:05 UTC** (`.github/workflows/catalog-release.yml`).
- **Cadence:** at most one registry **PATCH** per run when `packages/` changed.
- **Manual:** maintainers can run `workflow_dispatch` on the same workflow for urgent catalog publishes.

Platform or tooling merges (commits without the `package` scope) may still release immediately via `semantic-release`.

### Consumer impact

Refs like `v2.x` resolve to the latest published registry Git tag. After a package merge lands on `main`, the production catalog (this site’s default, CLI `agents.json` ref) may lag by up to ~24 hours until the next catalog release.

To preview merged catalog content before the next tag, point **Website settings** at a fork or explicit ref — see [Using the catalog](/docs/using-the-catalog). Normative release policy: [registry README — Release Workflow](https://github.com/agents-repo/registry/blob/main/README.md#release-workflow).

## registry-proxy

Production webapp and many CLI setups use [registry-proxy](https://github.com/agents-repo/registry-proxy) to cache GitHub Raw/contents responses. You can still link to the registry tree on GitHub for human review.

## Webapp vs CLI

- **Webapp**: loads `packages/index.json` for search/UI, then `packages/<namespace>/<package-id>/detail.json` for in-app package pages (latest snapshot, including README via `readmeMarkdown`). Offers Use in chat, downloads, and GitHub browse ([Using the catalog](/docs/using-the-catalog)).
- **CLI**: loads `packages/index.json`, then `versions/manifest.json` and version-scoped `metadata.json`, verifies ZIP integrity, and extracts `<version>-<target-id>.zip` into install target paths ([Installing packages](/docs/installing-packages)).

Normative formats live in [registry specs](https://github.com/agents-repo/registry/tree/main/specs). This guide does not duplicate spec text.
