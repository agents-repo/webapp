import { useLayoutEffect, useRef, type RefObject } from 'react'
import { prefersReducedMotion } from './prefersReducedMotion'

const ROUTE_ENTER_CLASS = 'app-route-content--enter'
const ROUTE_SETTLED_CLASS = 'app-route-content--settled'

interface UseRouteEnterAnimationOptions {
  readonly enabled?: boolean
}

export function useRouteEnterAnimation(
  pathname: string,
  options?: UseRouteEnterAnimationOptions,
): RefObject<HTMLDivElement | null> {
  const enabled = options?.enabled ?? true
  const isInitialRenderRef = useRef(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    if (!enabled) {
      return
    }

    const element = contentRef.current
    if (!element || prefersReducedMotion()) {
      return
    }

    element.classList.remove(ROUTE_SETTLED_CLASS)
    element.classList.add(ROUTE_ENTER_CLASS)

    const finishRouteEnter = (): void => {
      element.classList.remove(ROUTE_ENTER_CLASS)
      element.classList.add(ROUTE_SETTLED_CLASS)
    }

    element.addEventListener('animationend', finishRouteEnter, { once: true })
    const timeoutId = window.setTimeout(finishRouteEnter, 400)

    return () => {
      window.clearTimeout(timeoutId)
      element.removeEventListener('animationend', finishRouteEnter)
      element.classList.remove(ROUTE_ENTER_CLASS)
      element.classList.add(ROUTE_SETTLED_CLASS)
    }
  }, [enabled, pathname])

  return contentRef
}
