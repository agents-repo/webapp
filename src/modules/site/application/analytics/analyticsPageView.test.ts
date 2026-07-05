import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { siteRoutes } from '../../presentation/routes/siteRoutes.ts'
import { pushAnalyticsPageView } from './analyticsPageView.ts'
import { persistAnalyticsConsent, clearAnalyticsConsent } from './cookieConsent.ts'
import { clearTestStorage } from '../../../../test/testUtils.ts'

describe('pushAnalyticsPageView', () => {
  beforeEach(() => {
    clearTestStorage()
    window.dataLayer = []
    document.title = 'Agents Repo'
    vi.stubEnv('MODE', 'production')
    persistAnalyticsConsent('accepted')
  })

  afterEach(() => {
    clearTestStorage()
    delete window.dataLayer
    vi.unstubAllEnvs()
  })

  it('no-ops when MODE is not production', () => {
    vi.stubEnv('MODE', 'e2e')
    pushAnalyticsPageView(siteRoutes.about)
    expect(window.dataLayer).toHaveLength(0)
  })

  it('no-ops without accepted consent', () => {
    clearAnalyticsConsent()
    pushAnalyticsPageView(siteRoutes.about)
    expect(window.dataLayer).toHaveLength(0)
  })

  it('no-ops for unknown routes', () => {
    pushAnalyticsPageView('/unknown')
    expect(window.dataLayer).toHaveLength(0)
  })

  it('pushes page_view payload for known routes', () => {
    pushAnalyticsPageView(siteRoutes.about, '?tab=1')

    expect(window.dataLayer).toContainEqual({
      event: 'page_view',
      page_path: siteRoutes.about,
      page_location: `${window.location.origin}${siteRoutes.about}?tab=1`,
      page_title: 'Agents Repo',
    })
  })
})
