import { describe, expect, it } from 'vitest'
import {
  getDocBySlug,
  getDocRoutePaths,
  getDocSlugs,
  listDocManifestEntries,
} from './docsManifest.ts'
import { parseDocSlugFromPathname } from './docsNestedSiteRoutes.ts'

describe('docsManifest', () => {
  it('loads fourteen doc pages with unique slugs', () => {
    const slugs = getDocSlugs()
    expect(slugs).toHaveLength(14)
    expect(new Set(slugs).size).toBe(14)
  })

  it('resolves getting-started entry with frontmatter', () => {
    const entry = getDocBySlug('getting-started')
    expect(entry?.title).toBe('Getting started')
    expect(entry?.section).toBe('Start')
    expect(entry?.bodyMarkdown).toMatch(/Agents Repo/)
  })

  it('orders entries by frontmatter order field', () => {
    const orders = listDocManifestEntries().map((entry) => entry.order)
    const sorted = [...orders].sort((left, right) => left - right)
    expect(orders).toEqual(sorted)
  })

  it('exposes route paths for each slug', () => {
    expect(getDocRoutePaths()).toContain('/docs/installing-packages')
    expect(getDocRoutePaths()).toHaveLength(14)
  })
})

describe('docsNestedSiteRoutes', () => {
  it('parses known doc slugs', () => {
    expect(parseDocSlugFromPathname('/docs/cli-doctor')).toBe('cli-doctor')
  })

  it('returns undefined for docs index path', () => {
    expect(parseDocSlugFromPathname('/docs')).toBeUndefined()
    expect(parseDocSlugFromPathname('/guide')).toBeUndefined()
  })

  it('returns undefined for unknown slugs', () => {
    expect(parseDocSlugFromPathname('/docs/not-a-real-page')).toBeUndefined()
  })
})
