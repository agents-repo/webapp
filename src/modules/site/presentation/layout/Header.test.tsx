import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import { publicSitePath, siteRoutes } from '../routes/siteRoutes.ts'
import Header from './Header.tsx'

describe('Header', () => {
  it('uses trailing-slash hrefs for directory routes', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', publicSitePath(siteRoutes.about))
    expect(screen.getByRole('link', { name: 'Packages' })).toHaveAttribute(
      'href',
      publicSitePath(siteRoutes.packages),
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', siteRoutes.home)
  })
})
