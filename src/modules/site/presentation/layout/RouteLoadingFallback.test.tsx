import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import RouteLoadingFallback from './RouteLoadingFallback'

describe('RouteLoadingFallback', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders an accessible loading main landmark', () => {
    render(<RouteLoadingFallback />)

    const mainContent = document.getElementById('main-content')
    expect(mainContent).toBeInTheDocument()
    expect(mainContent).toHaveAttribute('aria-busy', 'true')
    expect(mainContent).toHaveAttribute('tabindex', '-1')
    expect(screen.getByText('Loading page content')).toHaveClass('visually-hidden')
  })
})
