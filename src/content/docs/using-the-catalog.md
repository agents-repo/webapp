---
title: Using the catalog
description: Search, package cards, in-app package pages, Use in chat, downloads, CLI commands from the UI, and website settings.
order: 30
section: Catalog
---

The catalog on [Home](/) and the crawlable [Packages](/packages) index lists
packages from the registry index. Each card shows metadata, status, supported
install targets, and actions. Footer actions use short labels (**CLI**, **Use in chat**, **Download**, **View**). **View** and the package title open the in-app
package page. **View on GitHub** is on that page. On narrow screens those labels stay visible; on medium and larger screens they stay collapsed (icon-first) until you hover or keyboard-focus that control, or until a menu or dialog from that control is open.

## Search and filters

Use the header search on large screens to filter packages by name or description. Review status badges and target compatibility before installing.

## Download and CLI actions

Package cards may offer:

- **Use in chat** when the registry marks the package as chat-web ready
  (`chatWeb`). This opens a dialog to copy instruction URLs (latest and
  pinned), instruction markdown with a short kind-aware preamble, and a
  starter prompt for ChatGPT, Grok, Gemini, or Microsoft Copilot in the
  browser. The ChatGPT tab includes **Open in ChatGPT**, and the Grok tab
  includes **Open in Grok**. Each opens a new tab with the starter prompt
  (latest instruction URLs). You must be signed in; ChatGPT or Grok may send
  the prompt automatically. Web chats may fail to fetch those URLs; if they
  cannot load a URL, copy the instruction markdown and paste it into the
  chat. Copying markdown for a flow includes the flow and its related agent
  files. Gemini and Microsoft Copilot remain copy-paste.
- **Direct download** links for version ZIPs per install target (when the registry publishes artifacts).
- **Copy CLI install** commands (`npx agents-repo install …`) for quick trials.
  The CLI popover stays inside the viewport: it flips below the button when
  there is not enough room above, and the panel scrolls if it is taller than
  the window.
- **View** opens the in-app package page (`/packages/<namespace>/<package-id>`).
  That page repeats CLI, Use in chat, and Download, and adds **View on GitHub**
  to inspect package source in the registry repository. The README on that page
  is the latest snapshot, loaded from `detail.json` (`readmeMarkdown`).

For reproducible projects, prefer pinning the CLI in `devDependencies` and using project scripts — see [Installing packages](/docs/installing-packages).

## Website settings

Use **Website settings** in the header to point the browser at a different registry base URL or ref (for example a fork or tag). This affects catalog loading in your session only; it does not change CLI config in your repositories.

## Install the site (PWA)

When your browser supports it, use **Install app** in the header to add agents-repo.org as an installed web app.

## Next steps

- [Discover packages](/docs/discover-packages) — search and `suggest-agents` workflows
- [Install targets](/docs/install-targets) — what target ids mean on disk
