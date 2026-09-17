/** Aligned with `src/locales/en/seo.json` → `home` (English site default OG). */
import { createRouteOgElement } from './route-card-layout.mjs'

const heroBadge = 'Open registry for agents and flows'
const heroTitle = 'Agents Repo'
const heroLead =
  'Discover agents and flows in our open registry. Install with the CLI for Copilot, Cursor, Claude Code, and Codex—or share your own.'

/**
 * @param {{ logoDataUrl: string }} options
 * @returns {import('satori').SatoriNode}
 */
export function createHomeOgElement({ logoDataUrl }) {
  return createRouteOgElement({
    logoDataUrl,
    heroBadge,
    heroTitle,
    heroLead,
    footerLabels: ['Browse packages', 'Read docs'],
  })
}
