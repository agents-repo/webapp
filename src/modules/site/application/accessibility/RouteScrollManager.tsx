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
  const pendingRequestRef = useRef<object | null>(null)

  useLayoutEffect(() => {
    const { history } = globalThis.window
    const previousRestoration = history.scrollRestoration

    try {
      history.scrollRestoration = 'manual'
    } catch {
      // Some test environments expose History without scrollRestoration.
    }

    const saveCurrentPosition = (): void => {
      writeRouteScrollPosition(locationKeyRef.current, globalThis.window.scrollY)
    }

    globalThis.window.addEventListener('pagehide', saveCurrentPosition)

    return () => {
      if (previousRestoration === 'auto' || previousRestoration === 'manual') {
        history.scrollRestoration = previousRestoration
      }
      globalThis.window.removeEventListener('pagehide', saveCurrentPosition)
    }
  }, [])

  useLayoutEffect(() => {
    const previousKey = locationKeyRef.current
    const pathnameChanged = pathnameRef.current !== location.pathname
    const hashChanged = hashRef.current !== location.hash

    if (!isInitialRenderRef.current) {
      writeRouteScrollPosition(previousKey, globalThis.window.scrollY)
    }

    locationKeyRef.current = location.key
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
    const action = navigationType
    const historyKey = location.key
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
  }, [location.hash, location.pathname, location.key, navigationType])

  return null
}

export default RouteScrollManager
