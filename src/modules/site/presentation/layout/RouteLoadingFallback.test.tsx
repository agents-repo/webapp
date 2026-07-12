import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import RouteLoadingFallback from './RouteLoadingFallback'

describe('RouteLoadingFallback', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders an accessible loading status message', () => {
    render(<RouteLoadingFallback />)

    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(screen.getByText('Loading page content')).toHaveClass('visually-hidden')
  })
})
