import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { samplePackageDetail } from '../../../../test/fixtures/samplePackageDetail'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackageDetailPage from './PackageDetailPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'
import { resetPackageDetailRepositoryForTests } from '../../infrastructure/packageDetailRepository'

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('PackageDetailPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    resetPackageDetailRepositoryForTests()
  })

  it('renders latest package detail and expands agent markdown', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('detail.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(samplePackageDetail),
        })
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Agent body'),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace/:packageId"
          element={<PackageDetailPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/agents-repo/sample-agent'] },
    )

    expect(screen.getByRole('heading', { name: 'sample-agent', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View sample-agent on GitHub/ })).toBeInTheDocument()
    expect(await screen.findByText('A sample README.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /A sample agent/ }))
    await waitFor(() => {
      expect(screen.getByText('Agent body')).toBeInTheDocument()
    })
  })

  it('shows not-found for an unknown package after the catalog loads', () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace/:packageId"
          element={<PackageDetailPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/agents-repo/missing-pkg'] },
    )

    expect(screen.getByRole('heading', { name: 'Package not found', level: 1 })).toBeInTheDocument()
  })
})
