import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { pushAnalyticsPageView } from './analyticsPageView.ts'

function AnalyticsRouteTracker() {
  const location = useLocation()
  const isInitialRenderRef = useRef(true)

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    pushAnalyticsPageView(location.pathname, location.search)
  }, [location.pathname, location.search])

  return null
}

export default AnalyticsRouteTracker
