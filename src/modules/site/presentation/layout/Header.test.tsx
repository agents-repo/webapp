import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import { publicSitePath, siteRoutes } from '../routes/siteRoutes.ts'
import Header from './Header.tsx'

function hrefsForRole(name: string): string[] {
  return screen.getAllByRole('link', { name }).map((link) => link.getAttribute('href') ?? '')
}

describe('Header', () => {
  afterEach(() => {
    cleanup()
  })

  it('uses trailing-slash hrefs for directory routes', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('link', { name: /Agents Repo/ })).toHaveAttribute('href', siteRoutes.home)
    expect(hrefsForRole('Packages')).toEqual([publicSitePath(siteRoutes.packages)])
    expect(hrefsForRole('Docs')).toEqual([publicSitePath(siteRoutes.docs)])
    expect(hrefsForRole('Help Us')).toEqual([publicSitePath(siteRoutes.helpUs)])
    expect(hrefsForRole('About').length).toBeGreaterThan(0)
    expect(hrefsForRole('About').every((href) => href === publicSitePath(siteRoutes.about))).toBe(true)
    expect(hrefsForRole('Community').length).toBeGreaterThan(0)
    expect(hrefsForRole('Community').every((href) => href === publicSitePath(siteRoutes.community))).toBe(
      true,
    )
    expect(hrefsForRole('Contact').length).toBeGreaterThan(0)
    expect(hrefsForRole('Contact').every((href) => href === publicSitePath(siteRoutes.contact))).toBe(true)
  })

  it('does not expose a Home text link besides the brand wordmark', () => {
    renderWithProviders(<Header />)

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Agents Repo/ })).not.toHaveAttribute('aria-current')
  })

  for (const entry of [siteRoutes.community, publicSitePath(siteRoutes.community)]) {
    it(`marks Community header links as the current page for ${entry}`, () => {
      renderWithProviders(<Header />, { initialEntries: [entry] })

      const communityLinks = screen.getAllByRole('link', { name: 'Community' })
      expect(communityLinks.length).toBeGreaterThan(0)
      for (const link of communityLinks) {
        expect(link).toHaveAttribute('aria-current', 'page')
      }
    })
  }

  it('announces the About toggle as the current section on grouped routes', () => {
    renderWithProviders(<Header />, { initialEntries: [siteRoutes.community] })

    expect(screen.getByRole('button', { name: /About\(current\)/ })).toBeInTheDocument()
  })

  it('does not announce the About toggle as current on other routes', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /About\(current\)/ })).not.toBeInTheDocument()
  })
})
