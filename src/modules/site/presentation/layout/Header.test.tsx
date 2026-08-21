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

  it('marks Community header links as the current page', () => {
    renderWithProviders(<Header />, { initialEntries: [publicSitePath(siteRoutes.community)] })

    const communityLinks = screen.getAllByRole('link', { name: 'Community' })
    expect(communityLinks.length).toBeGreaterThan(0)
    for (const link of communityLinks) {
      expect(link).toHaveAttribute('aria-current', 'page')
    }
  })
})
