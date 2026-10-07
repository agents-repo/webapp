import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { prefersReducedMotion } from './prefersReducedMotion'

interface AppRouteContentProps {
  readonly children: ReactNode
}

function AppRouteContent({ children }: AppRouteContentProps) {
  const location = useLocation()
  const isInitialRenderRef = useRef(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    const element = contentRef.current
    if (!element || prefersReducedMotion()) {
      return
    }

    element.classList.remove('app-route-content--settled')
    element.classList.add('app-route-content--enter')

    const finishRouteEnter = (): void => {
      element.classList.remove('app-route-content--enter')
      element.classList.add('app-route-content--settled')
    }

    element.addEventListener('animationend', finishRouteEnter, { once: true })
    const timeoutId = window.setTimeout(finishRouteEnter, 400)

    return () => {
      window.clearTimeout(timeoutId)
      element.removeEventListener('animationend', finishRouteEnter)
      element.classList.remove('app-route-content--enter')
      element.classList.add('app-route-content--settled')
    }
  }, [location.pathname])

  return (
    <div ref={contentRef} className="app-route-content app-route-content--settled">
      {children}
    </div>
  )
}

export default AppRouteContent
