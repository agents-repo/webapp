---
title: Submit a package
description: Fork-first workflow, optional tracking issue, AI-first package creation with full-package-creation-flow, validation, and squash-merge expectations.
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

With the GitHub CLI, push a scaffold commit so the branch head differs from
`main`, then open the draft pull request:

```bash
git commit --allow-empty -m "chore: scaffold draft package PR"
git push -u origin package/my-package

cat > pr-body.md <<'EOF'
## Summary

Draft package submission scaffold.

## Related Issues

Describe the package (namespace/package-id and intent). When a tracking issue
exists, replace this section with `Closes #<issue-number>`.
EOF

gh pr create --repo agents-repo/registry --draft \
  --head YOUR_GITHUB_USER:package/my-package \
  --base main \
  --title "feat(package): add my-package" \
  --body-file pr-body.md
```

When a tracking issue exists, include `Closes #<issue-number>` in `## Related Issues`. Otherwise, describe the package in that section.

## 5. Create the package

Package creation is **AI-first**. After the draft pull request is open, create
package source on the task branch. The registry clone already includes
[`agents-repo/agents-repo-package-creation`](https://github.com/agents-repo/registry/tree/main/packages/agents-repo/agents-repo-package-creation)
(extracted skills and agents for GitHub Copilot, Cursor, Claude Code, and OpenAI
Codex). You do not need a separate CLI install. See
[registry README — IDE Setup](https://github.com/agents-repo/registry/blob/main/README.md#ide-setup)
for where those files live.

### Suggested: invoke `full-package-creation-flow`

The flow runs registry npm scripts. Complete
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
setup first (`npm ci` and `npm run env:check` with the pinned Node/npm).

In your IDE, invoke the **`full-package-creation-flow`** flow (skill or agent,
depending on the install target). Describe the package you want. The flow
scaffolds with `package:create`, authors agents/flows and metadata, reviews for
submission readiness, then runs `package:validate`, `package:build`, and
`package:validate-artifacts` when it completes. You may exit after any step;
if you do, finish the pipeline in the next section.

Do not edit files under `versions/` by hand. The flow uses `package:build` for
version snapshots.

Push commits to your fork branch; the draft pull request updates automatically.

### Alternative: author files yourself

Add or update `packages/<namespace>/<package-id>/` with agents/flows and
`metadata.json` per [registry specs](https://github.com/agents-repo/registry/tree/main/specs).
Never create or modify files under `versions/` by hand; `package:build`
generates those artifacts.

Then run the commands in the next section.

## 6. Validate locally

From your local clone, use the pinned Node/npm in
[registry README — Development Environment](https://github.com/agents-repo/registry/blob/main/README.md#development-environment)
(`npm ci` and `npm run env:check`).

If the suggested flow finished through artifact validation, confirm CI on the
draft pull request. If you authored files yourself or the flow stopped early,
run this pipeline:

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
