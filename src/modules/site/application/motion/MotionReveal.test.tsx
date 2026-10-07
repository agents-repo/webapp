import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MotionReveal from './MotionReveal'

describe('MotionReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('marks hidden sections inert until intersection', () => {
    class PendingIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null
      readonly rootMargin = '0px'
      readonly scrollMargin = '0px'
      readonly thresholds: readonly number[] = []

      observe(): void {}

      unobserve(): void {}

      disconnect(): void {}

      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }

    vi.stubGlobal('IntersectionObserver', PendingIntersectionObserver)

    render(
      <MotionReveal>
        <p>Hidden until scroll</p>
      </MotionReveal>,
    )

    const wrapper = screen.getByText('Hidden until scroll').parentElement
    expect(wrapper).toHaveAttribute('inert')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders children and applies visible class when intersecting', () => {
    render(
      <MotionReveal>
        <p>Revealed content</p>
      </MotionReveal>,
    )

    expect(screen.getByText('Revealed content')).toBeInTheDocument()
    const wrapper = screen.getByText('Revealed content').parentElement
    expect(wrapper).toHaveClass('motion-reveal')
    expect(wrapper).toHaveClass('motion-reveal--visible')
  })
})
