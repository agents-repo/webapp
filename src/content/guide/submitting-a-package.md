---
title: Submit a package
description: Issue, branch, validation, build, draft PR, and squash-merge expectations for registry packages.
order: 120
section: Contribute
---

## 1. Open a tracking issue

Use the [package submission issue form](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-submission.yml) on **agents-repo/registry**.

## 2. Create a branch

```text
package/<issue-number>-<short-slug>
```

## 3. Author under packages/

Add or update `packages/<namespace>/<package-id>/` with agents/flows, `metadata.json`, and version artifacts per [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

## 4. Validate locally

From the registry repository (see CONTRIBUTING for pinned Node/npm):

```bash
npm run package:validate -- --package <namespace>/<package-id>
npm run package:build -- --package <namespace>/<package-id>
npm run package:validate-artifacts -- --package <namespace>/<package-id> --version <version>
```

## 5. Open a draft pull request

- Target `main` on **agents-repo/registry**
- Include `Closes #<issue>` in the PR body
- Mark ready for review only after CI and maintainer checklist pass

## 6. Squash merge title

Use **`feat(package): …`** for new packages or versions, or **`fix(package): …`** for corrections so registry release tags publish.

## Package corrections

For fixes to existing catalog entries, use the [package correction template](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml).

## Related

- [Contributing packages](/guide/contributing-packages) — policies and specs index
- [How the registry works](/guide/how-the-registry-works) — catalog layout
