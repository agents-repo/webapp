import { cleanup, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { filterableRegistryCatalog } from '../../../../test/fixtures/filterableRegistryCatalog'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import NamespacePackagesPage from './NamespacePackagesPage'
import {
  loadedCatalogContext,
  reloadingCatalogContext,
} from '../../../../test/fixtures/homePageTestFixtures'

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('NamespacePackagesPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('lists packages in the namespace and shows not-found for unknown namespaces', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    const { unmount } = renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace"
          element={<NamespacePackagesPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/agents-repo'] },
    )

    expect(screen.getByRole('heading', { name: 'agents-repo packages', level: 1 })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    unmount()

    const reloadCatalog = vi.fn().mockResolvedValue(undefined)
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      hasCompletedForcedReload: true,
      reloadCatalog,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace"
          element={<NamespacePackagesPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/missing-ns'] },
    )

    expect(screen.getByRole('heading', { name: 'Package not found', level: 1 })).toBeInTheDocument()
    expect(reloadCatalog).not.toHaveBeenCalled()
  })

  it('excludes yanked packages from the namespace listing summary', async () => {
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: filterableRegistryCatalog,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace"
          element={<NamespacePackagesPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/other-org'] },
    )

    expect(screen.getByRole('heading', { name: 'other-org packages', level: 1 })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'legacy-helper' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'yanked-agent' })).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 1 packages')).toBeInTheDocument()
  })

  it('keeps the namespace layout loading while a missing namespace is rechecked', () => {
    useRegistryCatalogMock.mockReturnValue(reloadingCatalogContext)

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace"
          element={<NamespacePackagesPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/missing-ns'] },
    )

    expect(screen.getByRole('heading', { name: 'missing-ns packages', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Package not found', level: 1 })).not.toBeInTheDocument()
  })

  it('requests a catalog reload when the listed catalog does not include the namespace', async () => {
    const reloadCatalog = vi.fn().mockResolvedValue(undefined)
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      reloadCatalog,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace"
          element={<NamespacePackagesPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/missing-ns'] },
    )

    expect(screen.getByRole('heading', { name: 'missing-ns packages', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Package not found', level: 1 })).not.toBeInTheDocument()

    await waitFor(() => {
      expect(reloadCatalog).toHaveBeenCalledTimes(1)
    })
  })

  it('shows not-found for invalid namespace segments without reloading the catalog', () => {
    const reloadCatalog = vi.fn().mockResolvedValue(undefined)
    useRegistryCatalogMock.mockReturnValue({
      ...reloadingCatalogContext,
      reloadCatalog,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/packages/:namespace"
          element={<NamespacePackagesPage setHeaderSearchSlot={() => {}} />}
        />
      </Routes>,
      { initialEntries: ['/packages/Invalid_Namespace'] },
    )

    expect(screen.getByRole('heading', { name: 'Package not found', level: 1 })).toBeInTheDocument()
    expect(reloadCatalog).not.toHaveBeenCalled()
  })
})
