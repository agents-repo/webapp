import { lazy, Suspense } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import RouteDocumentTitle from '../../application/accessibility/RouteDocumentTitle'
import LazyRouteErrorBoundary from '../layout/LazyRouteErrorBoundary'
import RouteLoadingFallback from '../layout/RouteLoadingFallback'

const LazyAboutPage = lazy(async () => import('../pages/AboutPage'))

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

function RouteShellHarness() {
  const location = useLocation()

  return (
    <>
      <RouteDocumentTitle />
      <main id="main-content" tabIndex={-1}>
        <LazyRouteErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/about" element={<LazyAboutPage />} />
            </Routes>
          </Suspense>
        </LazyRouteErrorBoundary>
      </main>
    </>
  )
}

describe('Route shell integration', () => {
  afterEach(() => {
    cleanup()
    document.title = ''
  })

  it('renders lazy route content inside the app-shell main landmark', async () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <RouteShellHarness />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(document.getElementById('main-content')).toBeInTheDocument()
    expect(document.title).toBe('About — Agents Repo')
  })

  it('has no detectable accessibility violations with the app-shell main landmark', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/about']}>
        <RouteShellHarness />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'About' })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
