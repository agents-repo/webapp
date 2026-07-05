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
  if (typeof globalThis.window === 'undefined') {
    return null
  }

  globalThis.window.dataLayer = globalThis.window.dataLayer ?? []

  if (typeof globalThis.window.gtag !== 'function') {
    globalThis.window.gtag = function gtag(...args: unknown[]) {
      globalThis.window.dataLayer?.push(args)
    }
  }

  return globalThis.window.gtag
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
  if (typeof globalThis.window === 'undefined') {
    return
  }

  globalThis.window.dataLayer = globalThis.window.dataLayer ?? []
  globalThis.window.dataLayer.push({
    event: 'consent_update',
    analytics_storage: analyticsStorage,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}
