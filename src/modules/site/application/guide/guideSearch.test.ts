import { describe, expect, it } from 'vitest'
import { searchGuidePages, stripGuideMarkdownForSearch } from './guideSearch.ts'

describe('stripGuideMarkdownForSearch', () => {
  it('removes markdown syntax and collapses whitespace', () => {
    const plain = stripGuideMarkdownForSearch(
      '# Heading\n\nSee [link](/guide/foo) and `code`.\n\n```js\nconst x = 1\n```',
    )

    expect(plain).toBe('Heading See link and .')
  })
})

describe('searchGuidePages', () => {
  it('returns empty results for blank query', () => {
    expect(searchGuidePages('')).toEqual([])
    expect(searchGuidePages('   ')).toEqual([])
  })

  it('returns no matches for unknown terms', () => {
    expect(searchGuidePages('zzzxxyyynotfound999')).toEqual([])
  })

  it('finds pages by title and ranks title matches first', () => {
    const results = searchGuidePages('getting started')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]?.slug).toBe('getting-started')
    expect(results[0]?.href).toBe('/guide/getting-started')
  })

  it('finds pages by body content with a snippet', () => {
    const results = searchGuidePages('semver')
    const lockfile = results.find((result) => result.slug === 'agents-json-lock')
    expect(lockfile).toBeDefined()
    expect(lockfile?.snippet.length).toBeGreaterThan(0)
  })

  it('respects maxResults', () => {
    const results = searchGuidePages('the', { maxResults: 2 })
    expect(results).toHaveLength(2)
  })
})
