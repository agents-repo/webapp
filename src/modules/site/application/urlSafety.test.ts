import { describe, expect, it } from 'vitest'
import { isSafeExternalHttpUrl } from './urlSafety'

describe('isSafeExternalHttpUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isSafeExternalHttpUrl('https://example.com/path')).toBe(true)
    expect(isSafeExternalHttpUrl('http://example.com/path')).toBe(true)
  })

  it('rejects non-http schemes', () => {
    expect(isSafeExternalHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    expect(isSafeExternalHttpUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects relative paths and malformed values', () => {
    expect(isSafeExternalHttpUrl('/relative/path')).toBe(false)
    expect(isSafeExternalHttpUrl('not-a-url')).toBe(false)
    expect(isSafeExternalHttpUrl('')).toBe(false)
  })
})
