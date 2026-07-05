import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  denyAllGoogleConsent,
  grantAnalyticsConsent,
  pushConsentUpdateEvent,
} from './googleConsentMode.ts'

describe('googleConsentMode', () => {
  beforeEach(() => {
    window.dataLayer = []
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args)
    }
  })

  afterEach(() => {
    delete window.dataLayer
    delete window.gtag
  })

  it('grants only analytics_storage on accept', () => {
    grantAnalyticsConsent()

    expect(window.dataLayer).toContainEqual([
      'consent',
      'update',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ])
  })

  it('denies all consent types on reject', () => {
    denyAllGoogleConsent()

    expect(window.dataLayer).toContainEqual([
      'consent',
      'update',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
      },
    ])
  })

  it('pushes consent_update event', () => {
    pushConsentUpdateEvent('granted')

    expect(window.dataLayer).toContainEqual({
      event: 'consent_update',
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })
})
