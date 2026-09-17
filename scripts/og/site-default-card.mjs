import { ogDark } from './constants.mjs'

const installTargets = ['GitHub Copilot', 'Cursor', 'Claude Code', 'OpenAI Codex']

/** Aligned with `src/locales/en/catalog.json` → `home.*` (English site default OG). */
const heroBadge = 'Open registry for agents and flows'
const heroTitle = 'Agents Repo'
const heroLead =
  'Find maintained packages in an open registry, install them with the CLI into your AI coding tools, and publish your own agents for others to use.'
const siteDomain = 'agents-repo.org'

/**
 * Satori element tree for the site-wide default Open Graph card.
 * @param {{ logoDataUrl: string }} options
 * @returns {import('satori').SatoriNode}
 */
export function createSiteDefaultOgElement({ logoDataUrl }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: ogDark.bg,
        backgroundImage: `radial-gradient(circle at 80% 20%, ${ogDark.accentPurple} 0%, transparent 50%), radial-gradient(circle at 0% 100%, ${ogDark.accentIndigo} 0%, transparent 40%)`,
        padding: '64px',
        fontFamily: 'Inter',
        color: ogDark.text,
        boxSizing: 'border-box',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: logoDataUrl,
                        width: 48,
                        height: 48,
                        style: {
                          objectFit: 'contain',
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '20px',
                          fontWeight: 600,
                          color: ogDark.muted,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        },
                        children: heroBadge,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '18px',
                    fontWeight: 500,
                    color: ogDark.subtle,
                  },
                  children: siteDomain,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '880px',
              marginTop: 'auto',
              marginBottom: 'auto',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: '64px',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.05,
                    margin: 0,
                    color: ogDark.text,
                  },
                  children: heroTitle,
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '24px',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: ogDark.muted,
                    margin: 0,
                  },
                  children: heroLead,
                },
              },
            ],
          },
        },
        {
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
              ...installTargets.map((label) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: ogDark.pillBg,
                    border: `1px solid ${ogDark.pillBorder}`,
                    color: ogDark.pillText,
                    fontSize: '16px',
                    fontWeight: 500,
                  },
                  children: label,
                },
              })),
            ],
          },
        },
      ],
    },
  }
}
