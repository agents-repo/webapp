import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getSitePageMeta } from './sitePageMeta'

function RouteAnnouncer() {
  const location = useLocation()
  const announcementRef = useRef<HTMLDivElement>(null)
  const isInitialRenderRef = useRef(true)

  useEffect(() => {
    const pageMeta = getSitePageMeta(location.pathname)
    const mainContent = document.getElementById('main-content')

    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    if (announcementRef.current) {
      announcementRef.current.textContent = `Navigated to ${pageMeta.routeLabel}`
    }

    const skipLinkWasUsed = document.activeElement?.classList.contains('skip-link')
    if (!skipLinkWasUsed && mainContent) {
      mainContent.focus({ preventScroll: false })
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
