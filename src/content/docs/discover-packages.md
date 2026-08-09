---
title: Discover packages
description: Find packages from the site catalog, CLI search, and suggest-agents scoring.
order: 40
section: Catalog
---

## On the website

1. Open [Home](/) and search or scroll the catalog.
2. Open a package’s GitHub tree link to read agents, flows, and `metadata.json`.
3. Copy a CLI install command from the card or note the package id (`namespace/package-id`).

See [Using the catalog](/docs/using-the-catalog) for UI details.

## With the CLI

| Command | Purpose |
| --- | --- |
| `agents-repo search <query>` | Search the registry index (aliases: `find`, `s`) |
| `agents-repo suggest-agents` | Rank packages from local `package.json`, README tokens, and installed ids (no LLM) |

`suggest-agents` does not require configured install targets. See the [CLI command reference](/docs/cli-commands) and [upstream suggest-agents docs](https://github.com/agents-repo/cli/blob/main/docs/commands/suggest-agents.md).

## Recommended path

Discover → evaluate source on GitHub → `agents-repo install <id>` (or bulk sync from `agents.json`) → commit [agents.json and lockfile](/docs/agents-json-lock).
