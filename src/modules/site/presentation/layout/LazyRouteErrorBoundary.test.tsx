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
        <LazyRouteErrorBoundary resetKey="/">
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
        <LazyRouteErrorBoundary resetKey="/">
          <ConditionalChild />
        </LazyRouteErrorBoundary>
      </MemoryRouter>,
    )

    shouldThrow = false
    screen.getByRole('button', { name: 'Try again' }).click()

    expect(await screen.findByText('Loaded page')).toBeInTheDocument()
  })

  it('calls onLazyRetry when Try again is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onLazyRetry = vi.fn()

    render(
      <MemoryRouter>
        <LazyRouteErrorBoundary resetKey="/" onLazyRetry={onLazyRetry}>
          <ThrowingChild shouldThrow />
        </LazyRouteErrorBoundary>
      </MemoryRouter>,
    )

    screen.getByRole('button', { name: 'Try again' }).click()

    expect(onLazyRetry).toHaveBeenCalledTimes(1)
  })

  it('clears the error state when resetKey changes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onLazyRetry = vi.fn()

    const { rerender } = render(
      <MemoryRouter initialEntries={['/error']}>
        <LazyRouteErrorBoundary resetKey="/error" onLazyRetry={onLazyRetry}>
          <ThrowingChild shouldThrow />
        </LazyRouteErrorBoundary>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/home']}>
        <LazyRouteErrorBoundary resetKey="/home" onLazyRetry={onLazyRetry}>
          <div>Home page</div>
        </LazyRouteErrorBoundary>
      </MemoryRouter>,
    )

    expect(onLazyRetry).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})
