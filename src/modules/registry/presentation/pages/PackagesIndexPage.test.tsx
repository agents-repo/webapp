import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackagesIndexPage from './PackagesIndexPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('PackagesIndexPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('uses a distinct heading from Home and links cards to package pages', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />)

    expect(screen.getByRole('heading', { name: 'All packages', level: 1 })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View sample-agent' })).toHaveAttribute(
      'href',
      '/packages/agents-repo/sample-agent',
    )
  })
})
