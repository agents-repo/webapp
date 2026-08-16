import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { samplePackageDetail } from '../../../../test/fixtures/samplePackageDetail'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackageDetailPage from './PackageDetailPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'
import { resetPackageDetailRepositoryForTests } from '../../infrastructure/packageDetailRepository'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('PackageDetailPage accessibility', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    resetPackageDetailRepositoryForTests()
  })

  it('has no detectable accessibility violations', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(samplePackageDetail),
      }),
    )

    const { container } = renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace/:packageId"
          element={<PackageDetailPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/agents-repo/sample-agent'] },
    )

    await screen.findByRole('heading', { name: 'README' })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
