/** Aligned with `src/locales/en/seo.json` → `docs`. */
import { createRouteOgElement } from './route-card-layout.mjs'

const heroBadge = 'Documentation hub'
const heroTitle = 'Docs'
const heroLead =
  'Docs for browsing the catalog, installing packages with the CLI, contributing to the registry, and downloading markdown for AI agents.'

/**
 * @param {{ logoDataUrl: string }} options
 * @returns {import('satori').SatoriNode}
 */
export function createDocsOgElement({ logoDataUrl }) {
  return createRouteOgElement({
    logoDataUrl,
    heroBadge,
    heroTitle,
    heroLead,
    footerLabels: ['CLI install', 'Agent markdown'],
  })
}
