import { describe, expect, it } from 'vitest'
import {
  GITHUB_ORGANIZATION_URL,
  getOrganizationSameAsUrls,
  socialLinks,
  twitterSite,
} from './socialLinks.ts'

describe('socialLinks', () => {
  it('has unique ids', () => {
    const ids = socialLinks.map((link) => link.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses absolute https hrefs', () => {
    for (const link of socialLinks) {
      expect(link.href).toMatch(/^https:\/\//)
      expect(link.label.length).toBeGreaterThan(0)
      expect(link.shortDescription.length).toBeGreaterThan(0)
      expect(link.accessibleLabel.length).toBeGreaterThan(0)
    }
  })

  it('includes X and Reddit with the public account URLs', () => {
    expect(socialLinks.map((link) => link.id)).toEqual(['x', 'reddit'])
    expect(socialLinks.find((link) => link.id === 'x')?.href).toBe('https://x.com/AgentsRepo')
    expect(socialLinks.find((link) => link.id === 'reddit')?.href).toBe(
      'https://www.reddit.com/r/agentsrepo/',
    )
  })

  it('builds Organization sameAs URLs from the catalog plus GitHub', () => {
    expect(getOrganizationSameAsUrls()).toEqual([
      'https://x.com/AgentsRepo',
      'https://www.reddit.com/r/agentsrepo/',
      GITHUB_ORGANIZATION_URL,
    ])
  })

  it('derives twitter:site from the X profile URL', () => {
    const xHref = socialLinks.find((link) => link.id === 'x')?.href

    if (xHref === undefined) {
      throw new Error('expected socialLinks to include an X profile href')
    }

    expect(twitterSite).toBe('@AgentsRepo')
    expect(twitterSite).toBe(`@${new URL(xHref).pathname.split('/').filter(Boolean)[0]}`)
  })
})
