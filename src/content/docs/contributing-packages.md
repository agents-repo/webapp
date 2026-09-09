---
title: Contributing packages
description: Policies, specs, and links for registry package authors.
order: 110
section: Contribute
---

Package source lives in the [registry](https://github.com/agents-repo/registry) repository under `packages/<namespace>/<package-id>/`.

## Before you start

- Packages must be **maintained** and ready for direct use.
- Declare supported **install targets** in metadata.
- Follow normative specs in [registry/specs](https://github.com/agents-repo/registry/tree/main/specs)
  (package format, `package-detail-schema.md`, agent/flow format, metadata,
  manifests, versioning).

## Submission workflow

Most contributors **fork** the registry, work on the fork, and open a pull request to **agents-repo/registry** `main`. A tracking issue on upstream is **recommended but not required**.

The suggested authoring path is the in-tree **`full-package-creation-flow`** (`agents-repo/agents-repo-package-creation`) after the draft pull request. Step-by-step checklist: **[Submit a package](/docs/submitting-a-package)**.

Human-facing requirements and review expectations: [registry CONTRIBUTING](https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md).

Squash-merge titles (`feat(package):`, `fix(package):`) classify package intent; catalog registry tags batch daily on the release train, not on every merge. See [How the registry works](/docs/how-the-registry-works) for timing and consumer impact.

## Corrections

Fixes to published packages use the same fork → upstream pull request model. The [package correction issue template](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) is optional but recommended. Squash-merge titles use `fix(package):` for the same intent classification; catalog tags still publish on the daily train.

## Help

Questions: [Contact](/contact) or registry GitHub Discussions. Package ideas: browse [Home](/) for examples.
