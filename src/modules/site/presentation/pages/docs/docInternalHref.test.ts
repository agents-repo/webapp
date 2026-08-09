import { describe, expect, it } from 'vitest'
import { isInternalSiteHref } from './docInternalHref.ts'

describe('isInternalSiteHref', () => {
  it('returns false for external and non-site paths', () => {
    expect(isInternalSiteHref('https://example.com')).toBe(false)
    expect(isInternalSiteHref('//evil.com')).toBe(false)
    expect(isInternalSiteHref('/docsextra')).toBe(false)
  })

  it('treats docs and repository routes as internal', () => {
    expect(isInternalSiteHref('/docs')).toBe(true)
    expect(isInternalSiteHref('/docs/getting-started')).toBe(true)
    expect(isInternalSiteHref('/repositories/registry')).toBe(true)
  })

  it('preserves query and hash when checking pathname', () => {
    expect(isInternalSiteHref('/contact?ref=guide')).toBe(true)
    expect(isInternalSiteHref('/docs/getting-started#section')).toBe(true)
  })
})
