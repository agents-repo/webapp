import { describe, expect, it } from 'vitest'
import {
  getRepositoryBySlug,
  getRepositorySlugs,
  listRepositoryManifestEntries,
  repositoryManifest,
} from './repositoryManifest.ts'

describe('repositoryManifest', () => {
  it('lists six immutable slugs in catalog order', () => {
    expect(getRepositorySlugs()).toEqual([
      'registry',
      'registry-proxy',
      'webapp',
      'cli',
      'github',
      'github-pages',
    ])
  })

  it('has unique slugs and required URLs', () => {
    const slugs = new Set<string>()
    for (const entry of repositoryManifest) {
      expect(slugs.has(entry.slug)).toBe(false)
      slugs.add(entry.slug)
      expect(entry.repository).toMatch(/^https:\/\/github\.com\//)
      expect(entry.contributing).toMatch(/^https:\/\//)
      expect(entry.issues).toMatch(/^https:\/\//)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeLessThanOrEqual(160)
    }
  })

  it('resolves entries by slug', () => {
    expect(getRepositoryBySlug('registry')?.name).toBe('Registry')
    expect(getRepositoryBySlug('not-a-repo')).toBeUndefined()
  })

  it('exposes a stable list helper', () => {
    expect(listRepositoryManifestEntries()).toHaveLength(6)
  })
})
