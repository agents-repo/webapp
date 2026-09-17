import { theme } from './constants.mjs'

const installTargets = ['GitHub Copilot', 'Cursor', 'Claude Code', 'OpenAI Codex']

/**
 * Satori element tree for the site-wide default Open Graph card.
 * @returns {import('satori').SatoriNode}
 */
export function createSiteDefaultOgElement() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${theme.bodyBg} 0%, #efe4ff 45%, ${theme.cardBg} 100%)`,
        padding: '56px 64px',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: theme.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '28px',
                    fontWeight: 700,
                    marginRight: '20px',
                  },
                  children: 'A',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '42px',
                          fontWeight: 700,
                          color: theme.headingColor,
                          lineHeight: 1.1,
                        },
                        children: 'Agents Repo',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '22px',
                          fontWeight: 400,
                          color: theme.secondary,
                          marginTop: '6px',
                        },
                        children: 'Open registry for agents and multi-agent flows',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: '28px',
              fontWeight: 400,
              color: theme.bodyColor,
              lineHeight: 1.35,
              maxWidth: '920px',
              marginBottom: '40px',
            },
            children:
              'Browse, compare, and install packages for your AI coding tools — catalog, docs, and chat-ready flows in one place.',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: 'auto',
            },
            children: installTargets.map((label) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  background: 'rgba(138, 42, 216, 0.12)',
                  border: `1px solid ${theme.borderColor}`,
                  color: theme.headingColor,
                  fontSize: '18px',
                  fontWeight: 600,
                },
                children: label,
              },
            })),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: '-80px',
              top: '-80px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'rgba(138, 42, 216, 0.08)',
            },
          },
        },
      ],
    },
  }
}
