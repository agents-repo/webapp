import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import HomePage from './HomePage'
import { sampleCatalogLoadResult } from './homePageA11yTestFixtures'

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
  it('has no detectable accessibility violations with catalog data', async () => {
    useRegistryCatalogMock.mockReturnValue({
      catalog: sampleCatalogLoadResult.catalog,
      cacheState: sampleCatalogLoadResult.cacheState,
      indexUrl: sampleCatalogLoadResult.indexUrl,
      registryBaseUrl: sampleCatalogLoadResult.registryBaseUrl,
      githubRepositoryUrl: sampleCatalogLoadResult.githubRepositoryUrl ?? '',
      errorMessage: sampleCatalogLoadResult.errorMessage ?? null,
      isLoading: false,
    })

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    await screen.findByRole('heading', { name: 'sample-agent' })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
