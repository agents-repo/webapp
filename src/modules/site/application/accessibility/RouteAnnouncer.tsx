import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  completePackageCatalogSearchFocusHandoff,
  isPackageCatalogSearchInputFocused,
  shouldSkipMainContentFocusForCatalogSearch,
} from '../../../registry/application/catalogSearchNavigation'
import { getSitePageMeta } from './sitePageMeta'
import { getRouteAnnouncementMessage, isMainRouteContentReady } from './routeContentReady'

function RouteAnnouncer() {
  const location = useLocation()
  const announcementRef = useRef<HTMLDivElement>(null)
  const isInitialRenderRef = useRef(true)
  const pathnameRef = useRef(location.pathname)
  const locationRef = useRef(location)

  useLayoutEffect(() => {
    pathnameRef.current = location.pathname
    locationRef.current = location
  }, [location])

  useEffect(() => {
    const announcedPathname = location.pathname

    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    const announceAndFocus = (): boolean => {
      if (pathnameRef.current !== announcedPathname) {
        return true
      }

      const mainContent = document.getElementById('main-content')
      if (!isMainRouteContentReady(mainContent)) {
        return false
      }

      const pageMeta = getSitePageMeta(announcedPathname)

      if (announcementRef.current) {
        announcementRef.current.textContent = getRouteAnnouncementMessage(
          pageMeta.routeLabel,
          mainContent,
        )
      }

      const skipLinkWasUsed = document.activeElement?.classList.contains('skip-link')
      const preserveCatalogSearchFocus =
        shouldSkipMainContentFocusForCatalogSearch(locationRef.current.state) ||
        isPackageCatalogSearchInputFocused()
      if (!skipLinkWasUsed && !preserveCatalogSearchFocus && mainContent) {
        mainContent.focus({ preventScroll: true })
      }

      if (preserveCatalogSearchFocus) {
        completePackageCatalogSearchFocusHandoff()
      }

      return true
    }

    if (announceAndFocus()) {
      return
    }

    const mainContent = document.getElementById('main-content')
    if (!mainContent) {
      return
    }

    const observer = new MutationObserver(() => {
      if (announceAndFocus()) {
        observer.disconnect()
      }
    })

    observer.observe(mainContent, {
      attributes: true,
      attributeFilter: ['aria-busy'],
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [location.pathname])

  return (
    <div
      ref={announcementRef}
      className="visually-hidden"
      aria-live="polite"
      aria-atomic="true"
    />
  )
}

export default RouteAnnouncer
