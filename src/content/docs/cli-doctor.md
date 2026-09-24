---
title: doctor diagnostics
description: Read-only CLI health checks for config, lock, registry reachability, and install paths.
order: 100
section: CLI
---

`agents-repo doctor` runs **read-only** diagnostics on the project setup. Normative behavior: [doctor command docs](https://github.com/agents-repo/cli/blob/main/docs/commands/doctor.md).

## When to run

- Before debugging failed `install` or PR baseline `agents:verify` failures (try `doctor --skip-artifact-download` for verify-style checks); also useful before local `agents:ci` when validating locks or extracts
- After changing `targets[]` or registry URL settings
- When lock and on-disk files may have drifted

## Checks (summary)

| Check id | Meaning |
| --- | --- |
| `config_schema` | `agents.json` passes schema validation |
| `targets_configured` | Non-empty `targets[]` |
| `lock_present` | Valid `agents-lock.json` |
| `lock_config_sync` | Config/lock package sets and ranges align (like `ci`, no `--force`) |
| `registry_reachable` | Catalog index fetch succeeds |
| `install_paths` | Locked artifacts map to paths that exist on disk |

Skipped checks appear when prerequisites fail (for example lock sync when the lock is missing).

## Usage

```bash
agents-repo doctor
agents-repo --json doctor
```

Project scope only; global `doctor -g` is reserved in the CLI.

## If something fails

| Symptom | Try |
| --- | --- |
| Missing targets | `agents-repo init --targets …` |
| Lock drift | `agents-repo install` or `update` |
| CI failures | Compare with `agents-repo list` warnings vs fatal `ci` errors |
| Registry errors | Verify registry URL/ref in config or env |

Command overview: [CLI command reference](/docs/cli-commands).
