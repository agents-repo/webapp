import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import RouteLoadingFallback from './RouteLoadingFallback'

describe('RouteLoadingFallback', () => {
  afterEach(() => {
    cleanup()
    document.getElementById('main-content')?.removeAttribute('aria-busy')
  })

  it('renders an accessible loading status message', () => {
    render(<RouteLoadingFallback />)

    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(screen.getByText('Loading page content')).toHaveClass('visually-hidden')
  })

  it('marks the app-shell main landmark as busy while loading', () => {
    const main = document.createElement('main')
    main.id = 'main-content'
    document.body.appendChild(main)

    try {
      render(<RouteLoadingFallback />)
      expect(main).toHaveAttribute('aria-busy', 'true')
    } finally {
      main.remove()
    }
  })
})
