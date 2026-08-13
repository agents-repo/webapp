export const GITHUB_ORGANIZATION_URL = 'https://github.com/agents-repo'

export const socialLinks = [
  {
    id: 'x',
    label: 'X',
    href: 'https://x.com/AgentsRepo',
    shortDescription: 'Announcements and informal conversation',
    accessibleLabel: 'Agents Repo on X',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    href: 'https://www.reddit.com/r/agentsrepo/',
    shortDescription: 'Community discussion and ideas',
    accessibleLabel: 'Agents Repo on Reddit',
  },
] as const

export type SocialLink = (typeof socialLinks)[number]

export type SocialLinkId = SocialLink['id']

const xProfileHostnames = new Set(['x.com', 'www.x.com'])

function getXProfileHandle(): string {
  const xLink = socialLinks.find((link) => link.id === 'x')
  if (!xLink) {
    throw new Error('socialLinks must include an X profile for twitter:site')
  }

  const parsed = new URL(xLink.href)
  if (parsed.protocol !== 'https:' || !xProfileHostnames.has(parsed.hostname)) {
    throw new Error('X social link href must be an https x.com profile URL')
  }

  const segments = parsed.pathname.split('/').filter((segment) => segment.length > 0)
  if (segments.length !== 1) {
    throw new Error('X social link href must be a single-segment profile URL')
  }

  return `@${segments[0]}`
}

export const twitterSite = getXProfileHandle()

export function getOrganizationSameAsUrls(): readonly string[] {
  return [...socialLinks.map((link) => link.href), GITHUB_ORGANIZATION_URL]
}
