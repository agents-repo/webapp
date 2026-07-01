import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { act, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import RouteAnnouncer from './RouteAnnouncer'

function RouteAnnouncerHarness({
  navigateRef,
}: {
  navigateRef?: { current: ReturnType<typeof useNavigate> | null }
} = {}) {
  const navigate = useNavigate()

  useEffect(() => {
    if (navigateRef) {
      navigateRef.current = navigate
    }
  }, [navigate, navigateRef])

  return (
    <>
      <RouteAnnouncer />
      <main id="main-content" tabIndex={-1}>
        Page content
      </main>
      <button
        type="button"
        onClick={() => {
          void navigate('/about')
        }}
      >
        Go to About
      </button>
      <Routes>
        <Route path="/" element={<h1>Home page</h1>} />
        <Route path="/about" element={<h1>About page</h1>} />
      </Routes>
    </>
  )
}

describe('RouteAnnouncer', () => {
  afterEach(() => {
    cleanup()
  })

  it('skips announcing the initial route', () => {
    renderWithProviders(<RouteAnnouncerHarness />, { initialEntries: ['/'] })

    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toBe('')
  })

  it('announces route changes and focuses main content', async () => {
    const user = userEvent.setup()

    renderWithProviders(<RouteAnnouncerHarness />, { initialEntries: ['/'] })

    await user.click(screen.getByRole('button', { name: 'Go to About' }))

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion?.textContent).toBe('Navigated to About')
      expect(document.getElementById('main-content')).toHaveFocus()
    })
  })

  it('does not move focus when the skip link was used', async () => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-link'
    skipLink.textContent = 'Skip to content'
    document.body.appendChild(skipLink)

    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }

    renderWithProviders(<RouteAnnouncerHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    skipLink.focus()

    act(() => {
      void navigateRef.current?.('/about')
    })

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion?.textContent).toBe('Navigated to About')
    })

    expect(document.getElementById('main-content')).not.toHaveFocus()
    skipLink.remove()
  })
})
