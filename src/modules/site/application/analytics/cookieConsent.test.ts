import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAnalyticsConsent,
  getStoredAnalyticsConsent,
  hasAnalyticsConsentDecision,
  persistAnalyticsConsent,
} from './cookieConsent.ts'
import { clearTestStorage } from '../../../../test/testUtils.ts'

describe('cookieConsent', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    clearTestStorage()
  })

  it('persists and reads analytics consent', () => {
    expect(getStoredAnalyticsConsent()).toBeNull()
    expect(hasAnalyticsConsentDecision()).toBe(false)

    persistAnalyticsConsent('accepted')
    expect(getStoredAnalyticsConsent()).toBe('accepted')
    expect(hasAnalyticsConsentDecision()).toBe(true)

    persistAnalyticsConsent('rejected')
    expect(getStoredAnalyticsConsent()).toBe('rejected')
  })

  it('clears stored consent', () => {
    persistAnalyticsConsent('accepted')
    clearAnalyticsConsent()
    expect(getStoredAnalyticsConsent()).toBeNull()
  })

  it('treats storage read failures as no stored consent', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(getStoredAnalyticsConsent()).toBeNull()
    expect(hasAnalyticsConsentDecision()).toBe(false)

    getItemSpy.mockRestore()
  })

  it('ignores storage write failures when persisting consent', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(() => persistAnalyticsConsent('accepted')).not.toThrow()
    expect(getStoredAnalyticsConsent()).toBeNull()

    setItemSpy.mockRestore()
  })

  it('ignores storage write failures when clearing consent', () => {
    persistAnalyticsConsent('accepted')
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(() => clearAnalyticsConsent()).not.toThrow()

    removeItemSpy.mockRestore()
  })
})
