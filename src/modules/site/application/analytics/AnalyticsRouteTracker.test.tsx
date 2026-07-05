import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import AnalyticsRouteTracker from './AnalyticsRouteTracker.tsx'
import * as analyticsPageView from './analyticsPageView.ts'
import { persistAnalyticsConsent } from './cookieConsent.ts'
import { siteRoutes } from '../../presentation/routes/siteRoutes.ts'
import { clearTestStorage } from '../../../../test/testUtils.ts'

function NavigationTrigger() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => {
        void navigate(siteRoutes.about)
      }}
    >
      Go to about
    </button>
  )
}

describe('AnalyticsRouteTracker', () => {
  beforeEach(() => {
    clearTestStorage()
    persistAnalyticsConsent('accepted')
    vi.stubEnv('MODE', 'production')
  })

  afterEach(() => {
    clearTestStorage()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('skips initial mount and pushes on subsequent navigations', () => {
    const pushSpy = vi.spyOn(analyticsPageView, 'pushAnalyticsPageView')

    render(
      <MemoryRouter initialEntries={[siteRoutes.home]}>
        <AnalyticsRouteTracker />
        <NavigationTrigger />
        <Routes>
          <Route path={siteRoutes.home} element={<div>Home</div>} />
          <Route path={siteRoutes.about} element={<div>About</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(pushSpy).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Go to about' }))

    expect(pushSpy).toHaveBeenCalledWith(siteRoutes.about, '')
  })
})
