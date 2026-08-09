---
title: Using the catalog
description: Search, package cards, downloads, CLI commands from the UI, and website settings.
order: 30
section: Catalog
---

The catalog on [Home](/) lists packages from the registry index. Each card shows metadata, status, supported install targets, and actions.

## Search and filters

Use the header search on large screens to filter packages by name or description. Review status badges and target compatibility before installing.

## Download and CLI actions

Package cards may offer:

- **Direct download** links for version ZIPs per install target (when the registry publishes artifacts).
- **Copy CLI install** commands (`npx agents-repo install …`) for quick trials.
- **Browse on GitHub** links to inspect package source in the registry repository.

For reproducible projects, prefer pinning the CLI in `devDependencies` and using project scripts — see [Installing packages](/docs/installing-packages).

## Website settings

Use **Website settings** in the header to point the browser at a different registry base URL or ref (for example a fork or tag). This affects catalog loading in your session only; it does not change CLI config in your repositories.

## Install the site (PWA)

When your browser supports it, use **Install app** in the header to add agents-repo.org as an installed web app.

## Next steps

- [Discover packages](/docs/discover-packages) — search and `suggest-agents` workflows
- [Install targets](/docs/install-targets) — what target ids mean on disk
