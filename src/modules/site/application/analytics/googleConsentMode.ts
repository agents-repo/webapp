import { getBrowserWindow } from '../browserGlobals.ts'

export interface GoogleConsentParams {
  readonly ad_storage?: 'denied' | 'granted'
  readonly ad_user_data?: 'denied' | 'granted'
  readonly ad_personalization?: 'denied' | 'granted'
  readonly analytics_storage?: 'denied' | 'granted'
  readonly functionality_storage?: 'denied' | 'granted'
  readonly personalization_storage?: 'denied' | 'granted'
  readonly security_storage?: 'denied' | 'granted'
  readonly wait_for_update?: number
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function getGtag(): ((...args: unknown[]) => void) | null {
  const browserWindow = getBrowserWindow()
  if (browserWindow === null) {
    return null
  }

  browserWindow.dataLayer = browserWindow.dataLayer ?? []

  if (typeof browserWindow.gtag !== 'function') {
    browserWindow.gtag = function gtag(...args: unknown[]) {
      browserWindow.dataLayer?.push(args)
    }
  }

  return browserWindow.gtag
}

export function callGoogleConsentCommand(
  command: 'default' | 'update',
  params: GoogleConsentParams,
): void {
  const gtag = getGtag()
  if (!gtag) {
    return
  }

  gtag('consent', command, params)
}

export function grantAnalyticsConsent(): void {
  callGoogleConsentCommand('update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  })
}

export function denyAllGoogleConsent(): void {
  callGoogleConsentCommand('update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
  })
}

export function pushConsentUpdateEvent(analyticsStorage: 'granted' | 'denied'): void {
  const browserWindow = getBrowserWindow()
  if (browserWindow === null) {
    return
  }

  browserWindow.dataLayer = browserWindow.dataLayer ?? []
  browserWindow.dataLayer.push({
    event: 'consent_update',
    analytics_storage: analyticsStorage,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}
