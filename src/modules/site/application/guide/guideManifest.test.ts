import { describe, expect, it } from 'vitest'
import {
  getGuideBySlug,
  getGuideRoutePaths,
  getGuideSlugs,
  listGuideManifestEntries,
} from './guideManifest.ts'
import { parseGuideSlugFromPathname } from './guideNestedSiteRoutes.ts'

describe('guideManifest', () => {
  it('loads fourteen guide pages with unique slugs', () => {
    const slugs = getGuideSlugs()
    expect(slugs).toHaveLength(14)
    expect(new Set(slugs).size).toBe(14)
  })

  it('resolves getting-started entry with frontmatter', () => {
    const entry = getGuideBySlug('getting-started')
    expect(entry?.title).toBe('Getting started')
    expect(entry?.section).toBe('Start')
    expect(entry?.bodyMarkdown).toMatch(/Agents Repo/)
  })

  it('orders entries by frontmatter order field', () => {
    const orders = listGuideManifestEntries().map((entry) => entry.order)
    const sorted = [...orders].sort((left, right) => left - right)
    expect(orders).toEqual(sorted)
  })

  it('exposes route paths for each slug', () => {
    expect(getGuideRoutePaths()).toContain('/guide/installing-packages')
    expect(getGuideRoutePaths()).toHaveLength(14)
  })
})

describe('guideNestedSiteRoutes', () => {
  it('parses known guide slugs', () => {
    expect(parseGuideSlugFromPathname('/guide/cli-doctor')).toBe('cli-doctor')
  })

  it('returns undefined for guide index path', () => {
    expect(parseGuideSlugFromPathname('/guide')).toBeUndefined()
  })

  it('returns undefined for unknown slugs', () => {
    expect(parseGuideSlugFromPathname('/guide/not-a-real-page')).toBeUndefined()
  })
})
