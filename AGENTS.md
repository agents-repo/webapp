# AGENTS.md

## Cursor Cloud specific instructions

Standard commands and workflow live in `README.md`, `docs/development.md`, and
`.github/copilot-instructions.md` (mirrored to
`.cursor/rules/agents-webapp.mdc`). Notes below are non-obvious environment
caveats for this Cloud VM.

### Toolchain (shared across the agents-repo repos)

- Node and npm are provided through `nvm` + Corepack. The Cloud startup/update
  script installs Node `24.15.0` and `24.18.0` and activates Corepack
  `npm@12.0.1`, so you normally do not reinstall them.
- Gotcha: `/exec-daemon/node` (Node 22) sits ahead of `nvm` on `PATH`, so a bare
  `node` resolves to Node 22. Prepend this repo's pinned Node bin (`24.18.0`)
  before running scripts:

  ```bash
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
  export PATH="$HOME/.nvm/versions/node/v$(tr -d ' \n\r' < .nvmrc)/bin:$PATH"; hash -r
  ```

  After this, `node -v` = `v24.18.0` and `npm -v` = `12.0.1`.

### This repo (Vite + React web app)

- Dev server: `npm run dev` serves on `http://localhost:5173`.
- The catalog is fetched over the network from the default registry-proxy
  (`https://registry-proxy.maiconfz.workers.dev`), so the VM needs internet
  egress for packages to load. The app resolves the `v2.x` alias via the proxy
  `GET /tags` endpoint, then fetches `packages/index.json` at the resolved tag
  (a direct `index.json?ref=v2.x` returns 404 by design — the alias must be
  resolved first).
- Validate with `npm run env:check`, `npm run lint:all`, `npm test`
  (256 vitest tests), `npm run typecheck`, and `npm run build`. Vite emits
  Bootstrap SCSS deprecation warnings during dev/build; these are expected and
  non-fatal.
