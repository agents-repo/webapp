#!/usr/bin/env bash
# Start the webapp Vite dev server after activating the pinned Node toolchain.
set -euo pipefail

export NVM_DIR="${NVM_DIR:-${HOME}/.nvm}"
# shellcheck disable=SC1091
source "${NVM_DIR}/nvm.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/.."

# nvm which current can resolve to /exec-daemon/node on Cloud VMs.
NODE_VERSION="$(tr -d '[:space:]' < .nvmrc)"
nvm use "${NODE_VERSION}"
NODE_BIN="$(dirname "$(nvm which "${NODE_VERSION}")")"
export PATH="${NODE_BIN}:${PATH}"
hash -r

exec npm run dev -- --host 0.0.0.0 --port 5173
