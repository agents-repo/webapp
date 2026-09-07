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

  it('resolves localized getting-started for es', () => {
    const entry = getDocBySlug('getting-started', 'es')
    expect(entry?.title).toBe('Primeros pasos')
    expect(entry?.usesEnglishFallback).toBe(false)
  })

  it('resolves localized cli-doctor for es', () => {
    const entry = getDocBySlug('cli-doctor', 'es')
    expect(entry?.title).toBe('Diagnósticos doctor')
    expect(entry?.usesEnglishFallback).toBe(false)
  })

  it('resolves all Spanish doc slugs without English fallback', () => {
    for (const slug of getDocSlugs()) {
      const entry = getDocBySlug(slug, 'es')
      expect(entry).toBeDefined()
      expect(entry?.usesEnglishFallback).toBe(false)
    }
  })

  it('resolves all pt-BR doc slugs without English fallback', () => {
    for (const slug of getDocSlugs()) {
      const entry = getDocBySlug(slug, 'pt-BR')
      expect(entry).toBeDefined()
      expect(entry?.usesEnglishFallback).toBe(false)
    }
  })

  it('resolves all pt-PT doc slugs without English fallback', () => {
    for (const slug of getDocSlugs()) {
      const entry = getDocBySlug(slug, 'pt-PT')
      expect(entry).toBeDefined()
      expect(entry?.usesEnglishFallback).toBe(false)
    }
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
