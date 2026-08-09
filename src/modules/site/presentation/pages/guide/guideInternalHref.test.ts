import { describe, expect, it } from 'vitest'
import { isInternalSiteHref } from './guideInternalHref.ts'

describe('isInternalSiteHref', () => {
  it('treats known static site routes as internal', () => {
    expect(isInternalSiteHref('/')).toBe(true)
    expect(isInternalSiteHref('/contact')).toBe(true)
    expect(isInternalSiteHref('/about')).toBe(true)
    expect(isInternalSiteHref('/help-us')).toBe(true)
  })

  it('treats guide and repository routes as internal', () => {
    expect(isInternalSiteHref('/guide')).toBe(true)
    expect(isInternalSiteHref('/guide/getting-started')).toBe(true)
    expect(isInternalSiteHref('/repositories')).toBe(true)
    expect(isInternalSiteHref('/repositories/cli')).toBe(true)
  })

  it('preserves hash and query when checking pathname', () => {
    expect(isInternalSiteHref('/contact?ref=guide')).toBe(true)
    expect(isInternalSiteHref('/guide/getting-started#section')).toBe(true)
  })

  it('does not treat external or ambiguous paths as internal', () => {
    expect(isInternalSiteHref('https://example.com')).toBe(false)
    expect(isInternalSiteHref('//evil.example')).toBe(false)
    expect(isInternalSiteHref('/guidextra')).toBe(false)
    expect(isInternalSiteHref('/unknown-page')).toBe(false)
  })
})
