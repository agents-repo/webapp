import { isKnownSiteRoute } from '../../presentation/routes/siteRoutes.ts'
import { isProductionAnalyticsEnabled } from './analyticsEnvironment.ts'
import { getStoredAnalyticsConsent } from './cookieConsent.ts'

function getBrowserWindow(): Window | null {
  const globalScope = globalThis as typeof globalThis & { window?: Window }

  return globalScope.window ?? null
}

function getBrowserDocument(): Document | null {
  const globalScope = globalThis as typeof globalThis & { document?: Document }

  return globalScope.document ?? null
}

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

  if (getBrowserWindow() === null || getBrowserDocument() === null) {
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
