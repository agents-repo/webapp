import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import PrivacyPage from './PrivacyPage.tsx'
import { localizedSitePath } from '../../application/i18n/localePath.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'

describe('PrivacyPage', () => {
  it('renders policy heading, contact link, and language cross-links', () => {
    renderWithProviders(<PrivacyPage />, { initialEntries: [siteRoutes.privacy] })

    expect(screen.getByRole('heading', { name: 'Privacy policy', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Português (Brasil)' })).toHaveAttribute(
      'href',
      localizedSitePath(siteRoutes.privacy, 'pt-BR'),
    )
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      localizedSitePath(siteRoutes.contact, 'en'),
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders European Portuguese policy without fallback banner', () => {
    const { container } = renderWithProviders(<PrivacyPage />, {
      initialEntries: [localizedSitePath(siteRoutes.privacy, 'pt-PT')],
    })
    const view = within(container)

    expect(view.getByRole('heading', { name: 'Política de privacidade', level: 1 })).toBeInTheDocument()
    expect(
      screen.queryByText(/apresentada em português do Brasil enquanto é preparada uma tradução dedicada/i),
    ).not.toBeInTheDocument()
    expect(view.getByRole('link', { name: 'Português (Brasil)' })).toHaveAttribute(
      'href',
      localizedSitePath(siteRoutes.privacy, 'pt-BR'),
    )
  })
})
