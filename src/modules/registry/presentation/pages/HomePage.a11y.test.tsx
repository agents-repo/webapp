import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { loadRegistryCatalog } from '../../infrastructure/registryRepository'
import HomePage from './HomePage'
import { sampleCatalogLoadResult } from './homePageA11yTestFixtures'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

vi.mock('../../infrastructure/registryRepository', () => ({
  loadRegistryCatalog: vi.fn(),
}))

const loadRegistryCatalogMock = vi.mocked(loadRegistryCatalog)

describe('HomePage accessibility', () => {
  beforeEach(() => {
    loadRegistryCatalogMock.mockResolvedValue(sampleCatalogLoadResult)
  })

  it('has no detectable accessibility violations with catalog data', async () => {
    const { container } = renderWithProviders(
      <HomePage
        setHeaderSearchSlot={() => {}}
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={() => {}}
      />,
    )

    await waitFor(() => {
      expect(loadRegistryCatalogMock).toHaveBeenCalled()
    })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
