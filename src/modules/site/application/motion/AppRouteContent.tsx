import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { prefersReducedMotion } from './prefersReducedMotion'

interface AppRouteContentProps {
  readonly children: ReactNode
}

function AppRouteContent({ children }: AppRouteContentProps) {
  const location = useLocation()
  const isInitialRenderRef = useRef(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    const element = contentRef.current
    if (!element || prefersReducedMotion()) {
      return
    }

    element.classList.add('app-route-content--enter')

    const clearEnterClass = (): void => {
      element.classList.remove('app-route-content--enter')
    }

    element.addEventListener('animationend', clearEnterClass, { once: true })
    const timeoutId = window.setTimeout(clearEnterClass, 400)

    return () => {
      window.clearTimeout(timeoutId)
      element.classList.remove('app-route-content--enter')
    }
  }, [location.pathname])

  return (
    <div ref={contentRef} className="app-route-content">
      {children}
    </div>
  )
}

export default AppRouteContent
