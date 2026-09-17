/** Aligned with `src/locales/en/seo.json` → `packages`. */
import { createRouteOgElement } from './route-card-layout.mjs'

const heroBadge = 'Package catalog'
const heroTitle = 'Packages'
const heroLead =
  'Browse every published Agents Repo package. Search agents and flows for Copilot, Cursor, Claude Code, and Codex.'

/**
 * @param {{ logoDataUrl: string }} options
 * @returns {import('satori').SatoriNode}
 */
export function createPackagesOgElement({ logoDataUrl }) {
  return createRouteOgElement({
    logoDataUrl,
    heroBadge,
    heroTitle,
    heroLead,
    footerLabels: ['Search & filter', 'Install with CLI'],
  })
}
