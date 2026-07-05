import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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
})
