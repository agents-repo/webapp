import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import CookieConsentBanner from './CookieConsentBanner.tsx'
import { siteRoutes } from '../routes/siteRoutes.ts'
import { clearTestStorage } from '../../../../test/testUtils.ts'
import * as googleTagManager from '../../application/analytics/googleTagManager.ts'
import * as analyticsPageView from '../../application/analytics/analyticsPageView.ts'

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    clearTestStorage()
    vi.stubEnv('MODE', 'production')
    window.dataLayer = []
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args)
    }
  })

  afterEach(() => {
    cleanup()
    clearTestStorage()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    delete window.dataLayer
    delete window.gtag
  })

  it('shows banner when no consent decision exists', () => {
    renderWithProviders(<CookieConsentBanner />)

    expect(screen.getByRole('region', { name: 'Cookie preferences' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', siteRoutes.privacy)
    expect(screen.getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute(
      'href',
      siteRoutes.privacyPt,
    )
  })

  it('accepts analytics and loads GTM', () => {
    const loadSpy = vi.spyOn(googleTagManager, 'loadGoogleTagManager').mockImplementation(() => {})
    const pushSpy = vi.spyOn(analyticsPageView, 'pushAnalyticsPageView').mockImplementation(() => {})

    renderWithProviders(<CookieConsentBanner />, { initialEntries: [siteRoutes.home] })

    fireEvent.click(screen.getByRole('button', { name: 'Accept analytics' }))

    expect(loadSpy).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalled()
    expect(screen.queryByRole('region', { name: 'Cookie preferences' })).not.toBeInTheDocument()
  })

  it('rejects analytics without loading GTM', () => {
    const loadSpy = vi.spyOn(googleTagManager, 'loadGoogleTagManager').mockImplementation(() => {})

    renderWithProviders(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Reject analytics' }))

    expect(loadSpy).not.toHaveBeenCalled()
    expect(screen.queryByRole('region', { name: 'Cookie preferences' })).not.toBeInTheDocument()
  })
})
