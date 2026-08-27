---
title: Discover packages
description: Find packages from the site catalog, CLI search, and suggest-agents scoring.
order: 40
section: Catalog
---

## On the website

1. Open [Home](/) to read what Agents Repo is, copy CLI install commands, search
   (search navigates to [Packages](/packages)), or browse the most-downloaded slice.
2. Open [Packages](/packages) to search, sort by download window, and filter by category, tags, install
   targets, status, cost band, or Use in chat. Filters apply to the website
   catalog only; they are not CLI search flags.
3. Open a package card (**View** or the title) to read the in-app package page. That page loads `detail.json` for the latest snapshot, including README when `readmeMarkdown` is present.
4. Copy a CLI install command from the card, use **Use in chat** when it is available, or note the package id (`namespace/package-id`). **View on GitHub** on the package page is for source inspection.

See [Using the catalog](/docs/using-the-catalog) for UI details.

## With the CLI

| Command | Purpose |
| --- | --- |
| `agents-repo search <query>` | Search the registry index (aliases: `find`, `s`) |
| `agents-repo suggest-agents` | Rank packages from local `package.json`, README tokens, and installed ids (no LLM) |

`suggest-agents` does not require configured install targets. See the [CLI command reference](/docs/cli-commands) and [upstream suggest-agents docs](https://github.com/agents-repo/cli/blob/main/docs/commands/suggest-agents.md).

## Recommended path

Discover → evaluate on the in-app package page → `agents-repo install <id>` (or bulk sync from `agents.json`) → commit [agents.json and lockfile](/docs/agents-json-lock).
