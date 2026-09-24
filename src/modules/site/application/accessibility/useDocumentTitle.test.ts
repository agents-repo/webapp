import { describe, expect, it } from 'vitest'
import { formatDocumentTitle } from './useDocumentTitle'

describe('formatDocumentTitle', () => {
  it('appends the site name to the page title', () => {
    expect(formatDocumentTitle('Discover Agents and Flows in Our Open Registry')).toBe(
      'Discover Agents and Flows in Our Open Registry — Agents Repo',
    )
    expect(formatDocumentTitle('Accessibility')).toBe('Accessibility — Agents Repo')
  })
})
