import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RouteErrorFallback from './RouteErrorFallback'

describe('RouteErrorFallback', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a recoverable error alert with retry and home actions', () => {
    render(
      <MemoryRouter>
        <RouteErrorFallback onRetry={() => {}} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page failed to load' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/')
  })
})
