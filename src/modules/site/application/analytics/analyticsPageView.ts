import { isKnownSiteRoute } from '../../presentation/routes/siteRoutes.ts'
import { isProductionAnalyticsEnabled } from './analyticsEnvironment.ts'
import { getStoredAnalyticsConsent } from './cookieConsent.ts'

export function pushAnalyticsPageView(pathname: string, search = ''): void {
  if (!isProductionAnalyticsEnabled()) {
    return
  }

  if (getStoredAnalyticsConsent() !== 'accepted') {
    return
  }

  if (!isKnownSiteRoute(pathname)) {
    return
  }

  if (typeof globalThis.window === 'undefined' || typeof document === 'undefined') {
    return
  }

  queueMicrotask(() => {
    if (getStoredAnalyticsConsent() !== 'accepted') {
      return
    }

    globalThis.window.dataLayer = globalThis.window.dataLayer ?? []
    globalThis.window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
      page_location: `${globalThis.window.location.origin}${pathname}${search}`,
      page_title: document.title,
    })
  })
}
