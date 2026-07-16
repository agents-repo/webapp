import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import HomePage from './HomePage'
import {
  loadedCatalogContext,
  loadingCatalogContext,
  reloadingCatalogContext,
} from './homePageA11yTestFixtures'

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('HomePage catalog loading', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows a loading spinner while the catalog is loading', () => {
    useRegistryCatalogMock.mockReturnValue(loadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(screen.getByText('Loading registry catalog')).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(container.querySelector('.fa-spin')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'sample-agent' })).not.toBeInTheDocument()
  })

  it('shows package cards after the catalog loads', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
    expect(container.querySelector('.fa-spin')).not.toBeInTheDocument()
  })

  it('keeps package cards visible during a settings reload', async () => {
    useRegistryCatalogMock.mockReturnValue(reloadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(container.querySelector('.fa-spin')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })
})
