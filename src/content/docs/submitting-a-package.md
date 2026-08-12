---
title: Submit a package
description: Fork-first workflow, optional tracking issue, branch naming, early draft PR, validation, and squash-merge expectations for registry packages.
order: 120
section: Contribute
---

Packages are contributed to the [registry](https://github.com/agents-repo/registry) through a pull request to `main`. Most contributors **fork** the registry repository, work on the fork, and open a pull request from the fork to **agents-repo/registry**.

This is different from using **Website settings** to preview a fork in the browser — see [Using the catalog](/docs/using-the-catalog).

## 1. Fork and clone

1. On GitHub, fork [agents-repo/registry](https://github.com/agents-repo/registry) to your account or organization.
2. Clone **your fork** (replace `YOUR_GITHUB_USER`):

   ```bash
   git clone https://github.com/YOUR_GITHUB_USER/registry.git
   cd registry
   ```

3. Add the upstream remote and fetch:

   ```bash
   git remote add upstream https://github.com/agents-repo/registry.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

Before starting a long-running branch, sync `main` from `upstream` again so your fork stays current.

## 2. Optional tracking issue

Opening a tracking issue on **upstream** (`agents-repo/registry`, not your fork) is **recommended but not required**.

Use the [package submission issue form](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-submission.yml) when you want maintainer feedback before heavy work, when scope is unclear, or when you prefer a linked discussion thread.

You may skip the issue for small, self-contained pull requests. When you do open one, note the issue number for branch naming and include `Closes #<issue-number>` in the pull request `## Related Issues` section.

## 3. Branch on your fork

Create a branch from updated `main`:

| Situation | Branch pattern | Example |
| --- | --- | --- |
| With tracking issue | `package/<issue-number>-<slug>` | `package/56-my-package` |
| Without tracking issue | `package/<slug>` | `package/my-package` |

`<slug>` is a short lowercase kebab-case package id or descriptor.

```bash
git checkout -b package/my-package
```

Org members with write access to **agents-repo/registry** may branch on the upstream repository directly; the fork flow is still recommended for isolation.

## 4. Open a draft pull request (early)

Open a **draft** pull request from your fork **before** substantive implementation commits. An empty scaffold commit is enough to open the PR if you have no file changes yet.

- **Base repository:** `agents-repo/registry`
- **Base branch:** `main`
- **Head repository:** your fork
- **Compare branch:** your task branch

In the GitHub UI: choose **compare across forks**, set the base to `agents-repo/registry` `main`, and set the head to `YOUR_GITHUB_USER:package/my-package`.

With the GitHub CLI (after pushing your branch to your fork):

```bash
git push -u origin package/my-package
gh pr create --repo agents-repo/registry --draft \
  --head YOUR_GITHUB_USER:package/my-package \
  --base main \
  --title "feat(package): add my-package" \
  --body-file pr-body.md
```

When a tracking issue exists, include `Closes #<issue-number>` in `## Related Issues`. Otherwise, describe the package in that section.

## 5. Author under packages/

Add or update `packages/<namespace>/<package-id>/` with agents/flows, `metadata.json`, and version artifacts per [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

Push commits to your fork branch; the draft pull request updates automatically.

## 6. Validate locally

From your local clone (see [registry CONTRIBUTING](https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md) for pinned Node/npm):

```bash
npm run package:validate -- --package <namespace>/<package-id>
npm run package:build -- --package <namespace>/<package-id>
npm run package:validate-artifacts -- --package <namespace>/<package-id> --version <version>
```

## 7. Ready for review and merge

Mark the pull request **ready for review** only after local validation and CI pass. Maintainers squash-merge with **`feat(package): …`** for new packages or versions, or **`fix(package): …`** for corrections so registry release tags publish.

## Keep your fork updated

While work is in progress, periodically sync from upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git checkout package/my-package
git merge main
```

Resolve conflicts before your final push.

## Package corrections

For fixes to existing catalog entries, use the same fork → upstream pull request model. The [package correction template](https://github.com/agents-repo/registry/blob/main/.github/ISSUE_TEMPLATE/package-correction.yml) is optional but recommended.

## Related

- [Contributing packages](/docs/contributing-packages) — policies and specs index
- [How the registry works](/docs/how-the-registry-works) — catalog layout
