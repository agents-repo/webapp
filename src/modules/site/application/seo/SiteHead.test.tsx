import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import AboutPage from '../../presentation/pages/AboutPage'
import SiteHead from './SiteHead'
import { siteRoutes } from '../../presentation/routes/siteRoutes'

describe('SiteHead', () => {
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
      'https://agents-repo.github.io/about',
    )
  })

  it('does not set document.title on its own', () => {
    document.title = 'Initial title'

    renderWithProviders(<SiteHead />, { initialEntries: [siteRoutes.about] })

    expect(document.title).toBe('Initial title')
  })

  it('works alongside useDocumentTitle on routed pages', () => {
    renderWithProviders(
      <>
        <SiteHead />
        <AboutPage />
      </>,
      { initialEntries: [siteRoutes.about] },
    )

    expect(document.title).toBe('About — Agents Repo')
  })
})
