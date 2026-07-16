import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import HomePage from './HomePage'
import { loadedCatalogContext, loadingCatalogContext } from './homePageTestFixtures'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('HomePage accessibility', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('has no detectable accessibility violations with catalog data', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    await screen.findByRole('heading', { name: 'sample-agent' })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })

  it('has no detectable accessibility violations while the catalog is loading', async () => {
    useRegistryCatalogMock.mockReturnValue(loadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(screen.getByText('Loading registry catalog')).toBeInTheDocument()

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
