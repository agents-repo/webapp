import { describe, expect, it } from 'vitest'
import { publicSitePath, siteRoutes } from './siteRoutes.ts'

describe('publicSitePath', () => {
  it.each([
    [siteRoutes.home, '/'],
    ['/', '/'],
    ['/about', '/about/'],
    ['/about/', '/about/'],
    ['/packages/ns/id', '/packages/ns/id/'],
    ['/docs/foo.md', '/docs/foo.md'],
    ['/sitemap.xml', '/sitemap.xml'],
    ['/robots.txt', '/robots.txt'],
    ['/llms.txt', '/llms.txt'],
    ['/about?ref=nav', '/about/?ref=nav'],
    ['/docs/getting-started#section', '/docs/getting-started/#section'],
    ['/docs/foo.md#top', '/docs/foo.md#top'],
  ])('maps %s to %s', (input, expected) => {
    expect(publicSitePath(input)).toBe(expected)
  })
})
