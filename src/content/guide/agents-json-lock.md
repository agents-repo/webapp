---
title: agents.json and lockfile
description: Project config, semver ranges, registry URL ref, lock slots per target, and what to commit.
order: 70
section: CLI
---

Normative schemas: [config-schema](https://github.com/agents-repo/cli/blob/main/specs/config-schema.md) and [lock-schema](https://github.com/agents-repo/cli/blob/main/specs/lock-schema.md).

## agents.json

Typical project fields:

| Field | Purpose |
| --- | --- |
| `targets[]` | Install target ids (`cursor`, `github-copilot`, …) |
| `packages` | Map of package id → semver range |
| Registry URL / ref | Where to fetch the catalog (org default uses registry-proxy + `v2.x`) |

Use `agents-repo init` and `add-target` to manage targets. Inspect with `agents-repo targets`.

## agents-lock.json

The lock records **resolved versions**, artifact URLs, integrity hashes, and per-target **`byTarget`** slots. Multi-target projects need a slot for each `(package, target)` pair that `install` or `ci` will apply.

| Command | Updates lock? | Resolves semver? |
| --- | --- | --- |
| `install` / `update` | Yes (unless `--no-save`) | Yes |
| `ci` | No | No — lock only |

## What to commit

Commit `agents.json`, `agents-lock.json`, and extracted files under target paths (for example `.cursor/`, `.github/`, `.claude/`, `.agents/`).

## Environment overrides

The CLI honors environment variables such as `AGENTS_REPO_REGISTRY_URL` and config path overrides. See cli docs for the full list.

## Related guides

- [Installing packages](/guide/installing-packages)
- [Install targets](/guide/install-targets)
- [`doctor`](/guide/cli-doctor) — config/lock alignment checks
