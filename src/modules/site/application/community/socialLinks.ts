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

export function getOrganizationSameAsUrls(): readonly string[] {
  return [...socialLinks.map((link) => link.href), GITHUB_ORGANIZATION_URL]
}
