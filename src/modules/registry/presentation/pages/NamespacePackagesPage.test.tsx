import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import NamespacePackagesPage from './NamespacePackagesPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'

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
  })
})
