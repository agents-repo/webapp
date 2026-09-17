import { ogDark } from './constants.mjs'
import { createOgPill, createRouteOgElement } from './route-card-layout.mjs'

const installTargets = ['GitHub Copilot', 'Cursor', 'Claude Code', 'OpenAI Codex']

/** Aligned with `src/locales/en/catalog.json` → `home.*` (English site default OG). */
const heroBadge = 'Open registry for agents and flows'
const heroTitle = 'Agents Repo'
const heroLead =
  'Find maintained packages in an open registry, install them with the CLI into your AI coding tools, and publish your own agents for others to use.'

/**
 * Satori element tree for the site-wide default Open Graph card.
 * @param {{ logoDataUrl: string }} options
 * @returns {import('satori').SatoriNode}
 */
export function createSiteDefaultOgElement({ logoDataUrl }) {
  return createRouteOgElement({
    logoDataUrl,
    heroBadge,
    heroTitle,
    heroLead,
    footerSection: {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        },
        children: [
          {
            type: 'span',
            props: {
              style: {
                fontSize: '15px',
                fontWeight: 600,
                color: ogDark.subtle,
                marginRight: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              },
              children: 'Supported in:',
            },
          },
          ...installTargets.map((label) => createOgPill(label)),
        ],
      },
    },
  })
}
