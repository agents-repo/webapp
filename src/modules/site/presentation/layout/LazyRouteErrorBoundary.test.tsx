import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LazyRouteErrorBoundary from './LazyRouteErrorBoundary'

function ThrowingChild({ shouldThrow }: { readonly shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('chunk failed')
  }

  return <div>Loaded page</div>
}

describe('LazyRouteErrorBoundary', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a recoverable fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <LazyRouteErrorBoundary>
          <ThrowingChild shouldThrow />
        </LazyRouteErrorBoundary>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page failed to load' })).toBeInTheDocument()
  })

  it('retries rendering children after Try again is clicked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    let shouldThrow = true
    function ConditionalChild() {
      return <ThrowingChild shouldThrow={shouldThrow} />
    }

    render(
      <MemoryRouter>
        <LazyRouteErrorBoundary>
          <ConditionalChild />
        </LazyRouteErrorBoundary>
      </MemoryRouter>,
    )

    shouldThrow = false
    screen.getByRole('button', { name: 'Try again' }).click()

    expect(await screen.findByText('Loaded page')).toBeInTheDocument()
  })
})
