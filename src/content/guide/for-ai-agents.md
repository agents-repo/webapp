---
title: For AI agents
description: Stable markdown URLs, llms.txt, and curl examples for automated readers.
order: 140
section: Agents
---

Agents Repo publishes **raw markdown** for each guide page at predictable URLs. Prefer these over scraping rendered HTML.

## llms.txt

Site root:

```text
https://agents-repo.org/llms.txt
```

## Guide markdown URLs

Replace the origin if you mirror the site; production uses `https://agents-repo.org`.

```text
https://agents-repo.org/guide/getting-started.md
https://agents-repo.org/guide/ecosystem-overview.md
https://agents-repo.org/guide/using-the-catalog.md
https://agents-repo.org/guide/discover-packages.md
https://agents-repo.org/guide/how-the-registry-works.md
https://agents-repo.org/guide/installing-packages.md
https://agents-repo.org/guide/agents-json-lock.md
https://agents-repo.org/guide/cli-commands.md
https://agents-repo.org/guide/install-targets.md
https://agents-repo.org/guide/cli-doctor.md
https://agents-repo.org/guide/contributing-packages.md
https://agents-repo.org/guide/submitting-a-package.md
https://agents-repo.org/guide/contributing-to-webapp.md
https://agents-repo.org/guide/for-ai-agents.md
```

## Example fetch

```bash
curl -fsSL 'https://agents-repo.org/guide/installing-packages.md'
curl -fsSL 'https://agents-repo.org/llms.txt'
```

## Catalog data

Registry index (default production ref via proxy — your environment may differ):

```bash
curl -fsSL 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v2.x'
```

Normative package rules remain in [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

## HTML routes

Human-readable pages live under `/guide` and `/guide/<slug>` with the same content as the `.md` files.
