---
title: For AI agents
description: Stable markdown URLs, llms.txt, publish flow, and curl examples for automated readers.
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

After `npm run build:pages`, **`llms.txt` is the authoritative list** of every site doc and package `.md` URL (the static block below is a snapshot; prefer fetching `llms.txt`).

## Publishing packages

Author workflow (human or agent assisting an author):

1. Fork [agents-repo/registry](https://github.com/agents-repo/registry), open a **draft** pull request to `main` — see [Submit a package](/docs/submitting-a-package).
2. Create package source under `packages/<namespace>/<package-id>/` (suggested: **`full-package-creation-flow`** in the registry clone).
3. Run local validation (`package:validate`, `package:build`, `package:validate-artifacts`) — commands in [Contributing packages](/docs/contributing-packages).
4. Mark the pull request ready for review after CI passes.

Policies and format primer: [Contributing packages](/docs/contributing-packages). Ecosystem priorities: [organization ROADMAP](https://github.com/agents-repo/.github/blob/main/ROADMAP.md).

Markdown mirrors: `/docs/submitting-a-package.md`, `/docs/contributing-packages.md`.

## CLI install

Consumer install docs (for agents helping users install catalog packages):

```bash
npm install -D agents-repo@<version>
npx agents-repo init --targets cursor github-copilot
npx agents-repo install <namespace>/<package-id>
```

Full guidance: [Installing packages](/docs/installing-packages) (`/docs/installing-packages.md`).

## Package URL patterns

| Surface | URL pattern |
| --- | --- |
| Site catalog (HTML) | `https://agents-repo.org/packages/<namespace>/<package-id>/` |
| Site package markdown | `https://agents-repo.org/packages/<namespace>/<package-id>.md` |
| Registry index JSON | `https://registry.agents-repo.org/packages/index.json?ref=v2.x` |
| Registry detail JSON | `https://registry.agents-repo.org/packages/<namespace>/<package-id>/detail.json?ref=v2.x` |
| Site doc markdown | `https://agents-repo.org/docs/<slug>.md` |

Package `.md` fallbacks and all doc `.md` URLs are listed in **`llms.txt`** after each production build.

## Catalog data

Registry index (default production ref via proxy — your environment may differ):

```bash
curl -fsSL 'https://registry.agents-repo.org/packages/index.json?ref=v2.x'
```

Latest-snapshot package detail for in-app pages (replace namespace and package id):

```bash
curl -fsSL 'https://registry.agents-repo.org/packages/<namespace>/<package-id>/detail.json?ref=v2.x'
```

`detail.json` is generated for the latest snapshot and may include `readmeMarkdown`. CLI install does not fetch it; it uses `versions/manifest.json` and target ZIPs. Normative package rules remain in [registry specs](https://github.com/agents-repo/registry/tree/main/specs).

`?ref=v2.x` resolves to the latest registry Git tag. After package merges, index and detail at that ref may not update until the next daily catalog release (~00:05 UTC). For bleeding-edge reads, use an explicit tag or `main` on a fork via registry-proxy.

## Site homepage (HTML)

Browser users load the interactive catalog at `https://agents-repo.org/`. For automated
readers, prefer `llms.txt` or the `.md` URLs below. The homepage HTML shell also includes
a `<noscript>` fallback summary for URL fetchers that do not execute JavaScript.

## Package markdown fallbacks

Each catalog package also has a static markdown URL on the site (build output):

```text
https://agents-repo.org/packages/<namespace>/<package-id>.md
```

`llms.txt` lists every doc and package `.md` URL after `npm run build:pages`.

## HTML routes

Human-readable pages live under `/docs` and `/docs/<slug>` with the same content as the `.md` files.
Package pages under `/packages/.../` remain the interactive SPA for browsers.
