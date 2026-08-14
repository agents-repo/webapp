import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import { siteRoutes } from '../routes/siteRoutes.ts'
import Footer from './Footer.tsx'

describe('Footer', () => {
  it('links the credits line to the Community page', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByRole('link', { name: 'Maicon + collaborators' })).toHaveAttribute(
      'href',
      siteRoutes.community,
    )
  })
})
