---
title: Using the catalog
description: Search, package cards, in-app package pages, Use in chat, downloads, CLI commands from the UI, website settings, and PWA install.
order: 30
section: Catalog
---

The catalog on [Home](/) shows a first slice of packages most downloaded in
the last year, with a **View all packages** link to the crawlable
[Packages](/packages) index. Each card shows metadata, status, supported
install targets, download counts, and actions. Footer actions use short labels (**CLI**, **Use in chat**, **Download**, **View**). **View** and the package title open the in-app
package page. **View on GitHub** is on that page. On narrow screens those labels stay visible; on medium and larger screens they stay collapsed (icon-first) until you hover or keyboard-focus that control, or until a menu or dialog from that control is open.

## Search and filters

[Home](/) search (hero and sticky header) navigates to [Packages](/packages)
with the query in the URL. An empty query stays on Home. Search matches
package name, owner, description, and tags. Filtering a card by owner from
Home opens Packages with `q=@owner`. The crawlable [Packages](/packages) index
uses the same search fields plus category, and adds store-style filters for
category, tags, install targets, status, cost band, and Use in chat. Selected
search, filters, and download-window sort are stored in the page URL so you
can reload or share the view.

On [Packages](/packages) and namespace listings, sort packages by download
window (**Downloads (All time)**, **Downloads (Last 7 days)**,
**Downloads (Last 30 days)**, **Downloads (Last 365 days)**). The default is
all time. Sorting does not hide packages. Popular category and tag chips sit
above the cards. The full checkbox groups are in a collapsible sidebar on
large screens (Hide filters / Show filters) and in a Filters panel on smaller
screens. Yanked packages stay hidden on those listings.

Use the header search on large screens to filter packages by name or
description. Review status badges and target compatibility before installing.

Package cards show the all-time download count under the status badge. Hover,
keyboard-focus, or click that count for last 7, 30, and 365 day windows (click
or tap keeps the panel open until you press Escape, click outside, or click
the count again). If you prefer reduced motion, hover does not open the
panel; focus, click, and keyboard still do. The package page shows those four
windows in a **Downloads** section beside **Versions**, with each window label
and count on the same line.

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
  is the latest snapshot, loaded from `detail.json` (`readmeMarkdown`). README
  and expanded agent or flow markdown render GitHub Flavored Markdown. Closed
  YAML frontmatter whose root is a mapping is shown as nested metadata tables
  (the same structure GitHub’s file view uses for `.agent.md` files).

For reproducible projects, prefer pinning the CLI in `devDependencies` and using project scripts — see [Installing packages](/docs/installing-packages).

## Website settings

Use **Website settings** in the header to point the browser at a different registry base URL or ref (for example a fork or tag). This affects catalog loading in your session only; it does not change CLI config in your repositories. **Clear cache and reload catalog** drops locally cached registry JSON and markdown in this browser (IndexedDB) and reloads the catalog. It does not delete ZIP downloads or change analytics, theme, or catalog filter sidebar preferences.

## Install the site (PWA)

You can add agents-repo.org as an installed web app when the browser supports it:

- **Chrome, Edge, and other Chromium browsers:** use **Install app** in the header, or the install icon in the address bar, after the site meets install criteria.
- **Safari on iPhone or iPad:** open Share and choose Add to Home Screen.
- **Safari on Mac:** choose File, then Add to Dock.
- **Firefox on Android:** open the browser menu and choose Install.
- **Firefox on desktop:** there is no native install from the web app manifest. The header **How to install this site** control explains this. Windows Firefox may offer Taskbar Tabs, which is not a PWA. A third-party extension can add Firefox desktop install, but it is not part of this site.

The header install control is hidden when the site is already running as an installed app.

## Next steps

- [Discover packages](/docs/discover-packages) — search and `suggest-agents` workflows
- [Install targets](/docs/install-targets) — what target ids mean on disk
