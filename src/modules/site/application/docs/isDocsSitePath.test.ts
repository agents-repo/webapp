import { describe, expect, it } from 'vitest'
import { isDocsSitePath } from './isDocsSitePath.ts'

describe('isDocsSitePath', () => {
  it('matches docs index and article paths', () => {
    expect(isDocsSitePath('/docs')).toBe(true)
    expect(isDocsSitePath('/docs/')).toBe(true)
    expect(isDocsSitePath('/docs/getting-started')).toBe(true)
  })

  it('does not match other site routes', () => {
    expect(isDocsSitePath('/')).toBe(false)
    expect(isDocsSitePath('/about')).toBe(false)
    expect(isDocsSitePath('/packages')).toBe(false)
    expect(isDocsSitePath('/docs-extra')).toBe(false)
  })
})
