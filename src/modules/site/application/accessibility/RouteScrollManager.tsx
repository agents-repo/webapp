import { useLayoutEffect, useRef } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'
import { whenMainRouteContentReady } from './routeContentReady'
import {
  applyHashTargetScroll,
  applyWindowScroll,
  getRouteScrollPosition,
  writeRouteScrollPosition,
} from './routeScroll'

function RouteScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const isInitialRenderRef = useRef(true)
  const pathnameRef = useRef(location.pathname)
  const hashRef = useRef(location.hash)
  const locationKeyRef = useRef(location.key)
  const navigationTypeRef = useRef(navigationType)
  const pendingRequestRef = useRef<object | null>(null)

  useLayoutEffect(() => {
    locationKeyRef.current = location.key
    navigationTypeRef.current = navigationType
  }, [location.key, navigationType])

  useLayoutEffect(() => {
    const saveCurrentPosition = (): void => {
      writeRouteScrollPosition(locationKeyRef.current, globalThis.window.scrollY)
    }

    globalThis.window.addEventListener('scroll', saveCurrentPosition, { passive: true })
    globalThis.window.addEventListener('pagehide', saveCurrentPosition)

    return () => {
      globalThis.window.removeEventListener('scroll', saveCurrentPosition)
      globalThis.window.removeEventListener('pagehide', saveCurrentPosition)
    }
  }, [])

  useLayoutEffect(() => {
    const pathnameChanged = pathnameRef.current !== location.pathname
    const hashChanged = hashRef.current !== location.hash
    pathnameRef.current = location.pathname
    hashRef.current = location.hash

    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    if (!pathnameChanged && !hashChanged) {
      return
    }

    const request = {}
    pendingRequestRef.current = request
    const action = navigationTypeRef.current
    const historyKey = locationKeyRef.current
    const nextHash = location.hash

    const applyIfCurrent = (): void => {
      if (pendingRequestRef.current !== request) {
        return
      }

      if (action === NavigationType.Pop) {
        applyWindowScroll(getRouteScrollPosition(historyKey) ?? 0)
        return
      }

      if (nextHash.length > 1) {
        applyHashTargetScroll(nextHash)
        return
      }

      applyWindowScroll(0)
    }

    if (action !== NavigationType.Pop && nextHash.length <= 1) {
      applyIfCurrent()
      return
    }

    const stopWaiting = whenMainRouteContentReady(applyIfCurrent)
    return () => {
      pendingRequestRef.current = null
      stopWaiting()
    }
  }, [location.hash, location.pathname])

  return null
}

export default RouteScrollManager
