import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { samplePackageDetail } from '../../../../test/fixtures/samplePackageDetail'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackageDetailPage from './PackageDetailPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'
import {
  clearRegistryPackageDetailCache,
  resetPackageDetailRepositoryForTests,
} from '../../infrastructure/packageDetailRepository'

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

  it('clears a previous detail error and shows loading when the registry base URL changes', async () => {
    clearRegistryPackageDetailCache()
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      registryBaseUrl: 'https://example.com/registry-failing',
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        }),
      ),
    )

    const view = renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace/:packageId"
          element={<PackageDetailPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/agents-repo/sample-agent'] },
    )

    expect(
      await screen.findByText('Unable to load package detail (503 Service Unavailable)'),
    ).toBeInTheDocument()
    expect(screen.getByText('No version list available.')).toBeInTheDocument()

    let resolveDetail: ((value: unknown) => void) | undefined
    const pendingDetail = new Promise((resolve) => {
      resolveDetail = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (String(url).includes('detail.json')) {
          return pendingDetail.then(() => ({
            ok: true,
            json: () => Promise.resolve(samplePackageDetail),
          }))
        }

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Agent body'),
        })
      }),
    )
    clearRegistryPackageDetailCache()
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      registryBaseUrl: 'https://example.com/registry-reloading',
    })

    view.rerender(
      <Routes>
        <Route
          path="/packages/:namespace/:packageId"
          element={<PackageDetailPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
    )

    await waitFor(() => {
      expect(
        screen.queryByText('Unable to load package detail (503 Service Unavailable)'),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Loading version list…')).toBeInTheDocument()
    })

    resolveDetail?.(undefined)
    expect(await screen.findByText('A sample README.')).toBeInTheDocument()
    expect(
      screen.queryByText('Unable to load package detail (503 Service Unavailable)'),
    ).not.toBeInTheDocument()
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
