---
title: Ecosystem overview
description: How registry, registry-proxy, webapp, CLI, and organization policies fit together.
order: 20
section: Start
---

The **agents-repo** organization ships a small platform:

| Piece | Role |
| --- | --- |
| [Registry](https://github.com/agents-repo/registry) | Specs, package source, validation, and versioned ZIP artifacts |
| [Registry proxy](https://github.com/agents-repo/registry-proxy) | Cached read-only access to registry files on GitHub |
| [Webapp](https://github.com/agents-repo/webapp) | This site — browse, search, and download |
| [CLI](https://github.com/agents-repo/cli) | Install and manage packages in your project (`agents.json`, lockfile) |
| [.github](https://github.com/agents-repo/.github) | Shared contributor workflow and policies |

## Public URLs

- Site: [agents-repo.org](https://agents-repo.org/)
- Per-repo pages: [Repositories](/repositories)
- Deeper diagrams: [organization ecosystem doc](https://github.com/agents-repo/.github/blob/main/docs/ecosystem.md)

## Data vs tooling

The registry is **data-first** (no runtime in the catalog). The webapp and CLI are **consumers** that read the same catalog index and manifests. See [How the registry works](/guide/how-the-registry-works) for the read path.
