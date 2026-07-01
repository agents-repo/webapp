import { describe, expect, it } from 'vitest'
import { formatDocumentTitle } from './useDocumentTitle'

describe('formatDocumentTitle', () => {
  it('appends the site name to the page title', () => {
    expect(formatDocumentTitle('Home')).toBe('Home — Agents Repo')
    expect(formatDocumentTitle('Accessibility')).toBe('Accessibility — Agents Repo')
  })
})
