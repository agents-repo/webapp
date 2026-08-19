import { getBrowserDocument, getBrowserWindow } from '../browserGlobals.ts'
import { isKnownSiteRoute, normalizeSitePathname } from '../../presentation/routes/siteRoutes.ts'
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

  if (getBrowserWindow() === null || getBrowserDocument() === null) {
    return
  }

  queueMicrotask(() => {
    if (getStoredAnalyticsConsent() !== 'accepted') {
      return
    }

    const browserWindow = getBrowserWindow()
    const browserDocument = getBrowserDocument()
    if (browserWindow === null || browserDocument === null) {
      return
    }

    const pagePath = normalizeSitePathname(pathname)

    browserWindow.dataLayer = browserWindow.dataLayer ?? []
    browserWindow.dataLayer.push({
      event: 'page_view',
      page_path: pagePath,
      page_location: `${browserWindow.location.origin}${pathname}${search}`,
      page_title: browserDocument.title,
    })
  })
}
