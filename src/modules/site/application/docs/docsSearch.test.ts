import { describe, expect, it } from 'vitest'
import { searchDocPages, stripDocMarkdownForSearch } from './docsSearch.ts'

describe('stripDocMarkdownForSearch', () => {
  it('removes markdown syntax and collapses whitespace', () => {
    const plain = stripDocMarkdownForSearch(
      '# Heading\n\nSee [link](/docs/foo) and `code`.\n\n```js\nconst x = 1\n```',
    )

    expect(plain).toBe('Heading See link and .')
  })
})

describe('searchDocPages', () => {
  it('returns empty results for blank query', () => {
    expect(searchDocPages('')).toEqual([])
    expect(searchDocPages('   ')).toEqual([])
  })

  it('returns no matches for unknown terms', () => {
    expect(searchDocPages('zzzxxyyynotfound999')).toEqual([])
  })

  it('finds pages by title and ranks title matches first', () => {
    const results = searchDocPages('getting started')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]?.slug).toBe('getting-started')
    expect(results[0]?.href).toBe('/docs/getting-started')
  })

  it('finds pages by body content with a snippet', () => {
    const results = searchDocPages('semver')
    const lockfile = results.find((result) => result.slug === 'agents-json-lock')
    expect(lockfile).toBeDefined()
    expect(lockfile?.snippet.length).toBeGreaterThan(0)
  })

  it('respects maxResults', () => {
    const results = searchDocPages('the', { maxResults: 2 })
    expect(results).toHaveLength(2)
  })
})
