---
title: CLI command reference
description: Subcommands, npm parity, aliases, and links to canonical CLI documentation.
order: 80
section: CLI
---

Behavior is defined in the [agents-repo/cli](https://github.com/agents-repo/cli) repository. This page is a **summary**; see `docs/commands/` for full flag and exit-code tables.

## Command matrix

| Command | npm analogue | Aliases | Notes |
| --- | --- | --- | --- |
| `init` | `npm init` (loose) | — | Create/update `agents.json`; `--targets` |
| `add-target` | — | — | Append target ids |
| `install` | `npm install` | `i`, `add`, `inst` | Variadic; updates lock |
| `ci` | `npm ci` | — | Lock-only install |
| `doctor` | `npm doctor` (loose) | — | Read-only diagnostics — [doctor doc](/docs/cli-doctor) |
| `update` | `npm update` | `up`, `upgrade` | Refresh within ranges |
| `search` | `npm search` | `find`, `s`, `se` | Registry search |
| `suggest-agents` | — | `suggest` | Local project signals |
| `list` | `npm list` | `ls` | Installed / lock view |
| `remove` | `npm uninstall` | `rm`, `uninstall`, `unlink` | Remove packages |
| `targets` | — | — | Show configured targets |

Source: [npm-cli-parity.md](https://github.com/agents-repo/cli/blob/main/docs/npm-cli-parity.md).

## Global flags (abbreviated)

| Flag | Notes |
| --- | --- |
| `-h` / `--help` | Help |
| `-V` / `--version` | CLI version |
| `--json` | Machine-readable output |
| `--verbose` | More detail on multi-target installs |
| `-y` / `--yes` | Waive dual-definition conflicts with warnings |
| `--dry-run` | Resolve without writes |
| `--no-save` | Skip config/lock writes |
| `--prefer-online` | Bypass local artifact cache |

### `-g` / `--global`

Supported on `init`, `install`, `update`, `remove`, `list`, `targets`. **Not** on `ci` or `doctor` (project scope).

## Per-command docs

| Command | Documentation |
| --- | --- |
| `init` | [init.md](https://github.com/agents-repo/cli/blob/main/docs/commands/init.md) |
| `add-target` | [add-target.md](https://github.com/agents-repo/cli/blob/main/docs/commands/add-target.md) |
| `install` | [install.md](https://github.com/agents-repo/cli/blob/main/docs/commands/install.md) |
| `ci` | [ci.md](https://github.com/agents-repo/cli/blob/main/docs/commands/ci.md) |
| `update` | [update.md](https://github.com/agents-repo/cli/blob/main/docs/commands/update.md) |
| `remove` | [remove.md](https://github.com/agents-repo/cli/blob/main/docs/commands/remove.md) |
| `search` | [search.md](https://github.com/agents-repo/cli/blob/main/docs/commands/search.md) |
| `suggest-agents` | [suggest-agents.md](https://github.com/agents-repo/cli/blob/main/docs/commands/suggest-agents.md) |
| `list` | [list.md](https://github.com/agents-repo/cli/blob/main/docs/commands/list.md) |
| `targets` | [targets.md](https://github.com/agents-repo/cli/blob/main/docs/commands/targets.md) |
| `doctor` | [doctor.md](https://github.com/agents-repo/cli/blob/main/docs/commands/doctor.md) |

## Project setup guides

- [Installing packages](/docs/installing-packages)
- [Install targets](/docs/install-targets)
- [agents.json and lockfile](/docs/agents-json-lock)
