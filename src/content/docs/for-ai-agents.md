---
title: For AI agents
description: Stable markdown URLs, llms.txt, and curl examples for automated readers.
order: 140
section: Agents
---

Agents Repo publishes **raw markdown** for each doc page at predictable URLs. Prefer these over scraping rendered HTML.

## llms.txt

Site root:

```text
https://agents-repo.org/llms.txt
```

## Doc markdown URLs

Replace the origin if you mirror the site; production uses `https://agents-repo.org`.

```text
https://agents-repo.org/docs/getting-started.md
https://agents-repo.org/docs/ecosystem-overview.md
https://agents-repo.org/docs/using-the-catalog.md
https://agents-repo.org/docs/discover-packages.md
https://agents-repo.org/docs/how-the-registry-works.md
https://agents-repo.org/docs/installing-packages.md
https://agents-repo.org/docs/agents-json-lock.md
https://agents-repo.org/docs/cli-commands.md
https://agents-repo.org/docs/install-targets.md
https://agents-repo.org/docs/cli-doctor.md
https://agents-repo.org/docs/contributing-packages.md
https://agents-repo.org/docs/submitting-a-package.md
https://agents-repo.org/docs/contributing-to-webapp.md
https://agents-repo.org/docs/for-ai-agents.md
```

## Example fetch

```bash
curl -fsSL 'https://agents-repo.org/docs/installing-packages.md'
curl -fsSL 'https://agents-repo.org/llms.txt'
```

## Catalog data

Registry index (default production ref via proxy — your environment may differ):

```bash
curl -fsSL 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v2.x'
```

Latest-snapshot package detail for in-app pages (replace namespace and package id):

```bash
curl -fsSL 'https://registry-proxy.maiconfz.workers.dev/packages/<namespace>/<package-id>/detail.json?ref=v2.x'
```

`detail.json` is generated for the latest snapshot and may include `readmeMarkdown`. CLI install does not fetch it; it uses `versions/manifest.json` and target ZIPs. Normative package rules remain in [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

## HTML routes

Human-readable pages live under `/docs` and `/docs/<slug>` with the same content as the `.md` files.
