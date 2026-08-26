import { cleanup, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { ROUTE_SCROLL_STORAGE_KEY } from './routeScroll'
import RouteScrollManager from './RouteScrollManager'

function RouteScrollHarness({
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
      <RouteScrollManager />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/about" element={<h1>About page</h1>} />
          <Route
            path="/docs"
            element={
              <div>
                <h1>Docs</h1>
                <section id="section">Section</section>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  )
}

function installScrollMock() {
  let scrollY = 0
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation((arg?: unknown, y?: unknown) => {
    if (typeof arg === 'number') {
      scrollY = typeof y === 'number' ? y : 0
      return
    }

    if (arg && typeof arg === 'object' && 'top' in arg) {
      const top = (arg as ScrollToOptions).top
      if (typeof top === 'number') {
        scrollY = top
      }
    }
  })

  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => scrollY,
  })

  return {
    scrollTo,
    setScrollY: (value: number) => {
      scrollY = value
    },
  }
}

describe('RouteScrollManager', () => {
  afterEach(() => {
    cleanup()
    sessionStorage.removeItem(ROUTE_SCROLL_STORAGE_KEY)
    vi.restoreAllMocks()
  })

  it('does not jump on the initial render', () => {
    const { scrollTo } = installScrollMock()

    renderWithProviders(<RouteScrollHarness />, { initialEntries: ['/'] })

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('resets window scroll on a PUSH pathname change', async () => {
    const { scrollTo, setScrollY } = installScrollMock()
    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }

    renderWithProviders(<RouteScrollHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(navigateRef.current).not.toBeNull()
    })

    setScrollY(480)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    scrollTo.mockClear()

    act(() => {
      void navigateRef.current!('/about')
    })

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('resets window scroll on a REPLACE pathname change', async () => {
    const { scrollTo, setScrollY } = installScrollMock()
    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }

    renderWithProviders(<RouteScrollHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(navigateRef.current).not.toBeNull()
    })

    setScrollY(120)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    scrollTo.mockClear()

    act(() => {
      void navigateRef.current!('/about', { replace: true })
    })

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('does not reset window scroll on a search-only change', async () => {
    const { scrollTo, setScrollY } = installScrollMock()
    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }

    renderWithProviders(<RouteScrollHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(navigateRef.current).not.toBeNull()
    })

    setScrollY(320)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    scrollTo.mockClear()

    act(() => {
      void navigateRef.current!('/?q=agent')
    })

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('restores the saved position on POP', async () => {
    const { scrollTo, setScrollY } = installScrollMock()
    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }

    renderWithProviders(<RouteScrollHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(navigateRef.current).not.toBeNull()
    })

    setScrollY(640)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    act(() => {
      void navigateRef.current!('/about')
    })
    scrollTo.mockClear()

    act(() => {
      void navigateRef.current!(-1)
    })

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, left: 0, behavior: 'instant' })
  })

  it('defers POP restore until route content is ready', async () => {
    const { scrollTo, setScrollY } = installScrollMock()
    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }

    renderWithProviders(<RouteScrollHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(navigateRef.current).not.toBeNull()
    })

    setScrollY(200)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    act(() => {
      void navigateRef.current!('/about')
    })
    scrollTo.mockClear()

    const main = document.getElementById('main-content')
    main?.setAttribute('aria-busy', 'true')

    act(() => {
      void navigateRef.current!(-1)
    })

    expect(scrollTo).not.toHaveBeenCalled()

    act(() => {
      main?.removeAttribute('aria-busy')
    })

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({ top: 200, left: 0, behavior: 'instant' })
    })
  })

  it('scrolls to a hash target after a PUSH pathname change', async () => {
    const { scrollTo } = installScrollMock()
    const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null }
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    })

    renderWithProviders(<RouteScrollHarness navigateRef={navigateRef} />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(navigateRef.current).not.toBeNull()
    })

    act(() => {
      void navigateRef.current!('/docs#section')
    })

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
    })
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
