import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import PrivacyPage from './PrivacyPage.tsx'
import { publicSitePath, siteRoutes } from '../routes/siteRoutes.ts'

describe('PrivacyPage', () => {
  it('renders policy heading, contact link, and language cross-link', () => {
    renderWithProviders(<PrivacyPage />, { initialEntries: [siteRoutes.privacy] })

    expect(screen.getByRole('heading', { name: 'Privacy policy', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Versão em português (Brasil)' })).toHaveAttribute(
      'href',
      publicSitePath(siteRoutes.privacyPtBr),
    )
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', publicSitePath(siteRoutes.contact))
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
