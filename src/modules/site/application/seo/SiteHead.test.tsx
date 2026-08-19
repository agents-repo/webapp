import { afterEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'
import { RegistryCatalogContext } from '../../../registry/presentation/catalog/registryCatalogContext'
import AboutPage from '../../presentation/pages/AboutPage'
import RouteDocumentTitle from '../accessibility/RouteDocumentTitle'
import SiteHead from './SiteHead'
import { siteRoutes } from '../../presentation/routes/siteRoutes'

describe('SiteHead', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('updates SEO meta tags for the active route', () => {
    renderWithProviders(
      <>
        <SiteHead />
        <AboutPage />
      </>,
      { initialEntries: [siteRoutes.about] },
    )

    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      'Learn about Agents Repo',
    )
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://agents-repo.org/about/',
    )
  })

  it('does not set document.title on its own', () => {
    document.title = 'Initial title'

    renderWithProviders(<SiteHead />, { initialEntries: [siteRoutes.about] })

    expect(document.title).toBe('Initial title')
  })

  it('works alongside RouteDocumentTitle on routed pages', () => {
    renderWithProviders(
      <>
        <SiteHead />
        <RouteDocumentTitle />
        <AboutPage />
      </>,
      { initialEntries: [siteRoutes.about] },
    )

    expect(document.title).toBe('About — Agents Repo')
  })

  it('marks unknown paths as non-indexable without home canonical', () => {
    renderWithProviders(<SiteHead />, { initialEntries: ['/missing-page'] })

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.querySelector('meta[name="description"]')).toBeNull()
  })

  it('does not noindex a missing package path until membership recheck finishes', () => {
    renderWithProviders(
      <RegistryCatalogContext.Provider value={loadedCatalogContext}>
        <SiteHead />
      </RegistryCatalogContext.Provider>,
      { initialEntries: ['/packages/agents-repo/missing-pkg'] },
    )

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow')
  })

  it('noindexes a missing package path after a forced catalog reload', () => {
    renderWithProviders(
      <RegistryCatalogContext.Provider
        value={{ ...loadedCatalogContext, hasCompletedForcedReload: true }}
      >
        <SiteHead />
      </RegistryCatalogContext.Provider>,
      { initialEntries: ['/packages/agents-repo/missing-pkg'] },
    )

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow')
  })
})
