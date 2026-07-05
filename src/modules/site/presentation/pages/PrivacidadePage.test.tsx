import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import PrivacidadePage from './PrivacidadePage.tsx'
import { siteRoutes } from '../routes/siteRoutes.ts'

describe('PrivacidadePage', () => {
  it('renders policy heading, contact link, and language cross-link', () => {
    renderWithProviders(<PrivacidadePage />, { initialEntries: [siteRoutes.privacyPtBr] })

    expect(screen.getByRole('heading', { name: 'Política de privacidade', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'English version' })).toHaveAttribute('href', siteRoutes.privacy)
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute('href', siteRoutes.contact)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
