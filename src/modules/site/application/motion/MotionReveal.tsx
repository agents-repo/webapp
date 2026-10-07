import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { prefersReducedMotion } from './prefersReducedMotion'

export interface MotionRevealProps {
  readonly children: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
  /** Stagger scroll reveals (capped in CSS for long lists). */
  readonly delayMs?: number
}

const MAX_REVEAL_DELAY_MS = 400

function MotionReveal({ children, className, style, delayMs = 0 }: MotionRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(() => prefersReducedMotion())
  const [isSettled, setIsSettled] = useState(() => prefersReducedMotion())
  const cappedDelay = Math.min(Math.max(delayMs, 0), MAX_REVEAL_DELAY_MS)

  useEffect(() => {
    if (prefersReducedMotion()) {
      return
    }

    const element = elementRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.12,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isVisible || prefersReducedMotion()) {
      return
    }

    const element = elementRef.current
    if (!element) {
      return
    }

    const settle = (): void => {
      setIsSettled(true)
    }

    element.addEventListener('animationend', settle, { once: true })
    const timeoutId = window.setTimeout(settle, 600)

    return () => {
      window.clearTimeout(timeoutId)
      element.removeEventListener('animationend', settle)
    }
  }, [isVisible])

  const revealStyle: CSSProperties = {
    ...style,
    ...(cappedDelay > 0 && !prefersReducedMotion()
      ? ({ '--motion-reveal-delay': `${cappedDelay}ms` } as CSSProperties)
      : {}),
  }

  const classNames = [
    'motion-reveal',
    isVisible ? 'motion-reveal--visible' : '',
    isSettled ? 'motion-reveal--settled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const hideFromInteraction = !isVisible && !prefersReducedMotion()

  return (
    <div
      ref={elementRef}
      className={classNames}
      style={revealStyle}
      inert={hideFromInteraction ? true : undefined}
      aria-hidden={hideFromInteraction ? true : undefined}
    >
      {children}
    </div>
  )
}

export default MotionReveal
