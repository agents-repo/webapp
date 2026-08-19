import { describe, expect, it } from 'vitest'
import { publicSitePath, siteRoutes } from './siteRoutes.ts'

describe('publicSitePath', () => {
  it('keeps home as a single slash', () => {
    expect(publicSitePath(siteRoutes.home)).toBe('/')
    expect(publicSitePath('/')).toBe('/')
  })

  it('adds a trailing slash to directory routes', () => {
    expect(publicSitePath('/about')).toBe('/about/')
    expect(publicSitePath('/about/')).toBe('/about/')
    expect(publicSitePath('/packages/ns/id')).toBe('/packages/ns/id/')
  })

  it('leaves file URLs unslashed', () => {
    expect(publicSitePath('/docs/foo.md')).toBe('/docs/foo.md')
    expect(publicSitePath('/sitemap.xml')).toBe('/sitemap.xml')
    expect(publicSitePath('/robots.txt')).toBe('/robots.txt')
    expect(publicSitePath('/llms.txt')).toBe('/llms.txt')
  })

  it('preserves query and hash suffixes', () => {
    expect(publicSitePath('/about?ref=nav')).toBe('/about/?ref=nav')
    expect(publicSitePath('/docs/getting-started#section')).toBe('/docs/getting-started/#section')
    expect(publicSitePath('/docs/foo.md#top')).toBe('/docs/foo.md#top')
  })
})
