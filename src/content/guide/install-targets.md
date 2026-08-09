---
title: Install targets
description: Canonical target ids, typical on-disk paths, and init/add-target workflows.
order: 90
section: CLI
---

Install targets describe **where** package ZIPs are extracted in a consumer project (or global home with `-g`).

## Target matrix

| Target id | Label | Typical project paths (high level) |
| --- | --- | --- |
| `github-copilot` | GitHub Copilot | `.github/` agents and instructions |
| `cursor` | Cursor | `.cursor/rules/`, `.cursor/skills/`, … |
| `claude-code` | Claude Code | `.claude/agents/`, … |
| `openai-codex` | OpenAI Codex | `.agents/skills/`, … |

Exact paths depend on package content and target adapters. Catalog metadata lists which targets a package supports.

## Configure targets

```bash
agents-repo init --targets cursor github-copilot claude-code openai-codex
agents-repo add-target openai-codex
agents-repo targets
```

`--target` is an alias for `--targets` on `init`. Use JSON output with `agents-repo --json targets`.

## Multi-target locks

When multiple targets are configured, each installed package needs matching `byTarget` entries in `agents-lock.json`. After changing targets or packages, run `install` or `update` locally before enabling `agents:ci` in CI.

## Catalog alignment

The webapp shows supported targets on package cards. Your project `targets[]` must overlap package support for a successful install.

See [agents.json and lockfile](/guide/agents-json-lock) and [Installing packages](/guide/installing-packages).
