import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MotionReveal from './MotionReveal'

describe('MotionReveal', () => {
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
