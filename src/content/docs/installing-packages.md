---
title: Installing packages
description: Pin the CLI as a devDependency, initialize targets, install from the catalog, and reproduce in CI.
order: 60
section: CLI
---

## Pin the CLI (recommended)

For real projects, add the CLI as a **devDependency** so teammates and CI use the same version:

```bash
npm install -D agents-repo@<version>
```

Example `package.json` scripts (this webapp uses the same pattern):

```json
{
  "scripts": {
    "agents:install": "agents-repo install",
    "agents:update": "agents-repo update",
    "agents:ci": "agents-repo ci"
  }
}
```

`npx agents-repo@latest` is fine for **one-off trials**; pinned installs are better for reproducibility.

## Initialize install targets

```bash
npx agents-repo init --targets cursor github-copilot
```

See [Install targets](/docs/install-targets) for canonical ids and on-disk layout.

## Install packages

Add ids to `agents.json` `packages` and run bulk install, or install directly:

```bash
npx agents-repo install agents-repo/some-package
```

Commit **`agents.json`** and **`agents-lock.json`** when they change. Details: [agents.json and lockfile](/docs/agents-json-lock).

## CI

```bash
npm ci
npm run agents:ci
```

`ci` installs exactly from the lockfile (npm `ci` parity). See [CLI `ci` docs](https://github.com/agents-repo/cli/blob/main/docs/commands/ci.md).

## Troubleshooting

Run [`agents-repo doctor`](/docs/cli-doctor) before debugging install failures. Full command list: [CLI command reference](/docs/cli-commands). CLI repository: [/repositories/cli](/repositories/cli).
