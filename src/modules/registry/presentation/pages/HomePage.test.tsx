import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import HomePage from './HomePage'
import {
  loadedCatalogContext,
  loadingCatalogContext,
  reloadingCatalogContext,
} from '../../../../test/fixtures/homePageTestFixtures'

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
    expect(container.querySelector('.catalog-loading-spinner')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'sample-agent' })).not.toBeInTheDocument()
  })

  it('shows package cards after the catalog loads', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
  })

  it('keeps package cards visible during a settings reload', async () => {
    useRegistryCatalogMock.mockReturnValue(reloadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })

  it('does not show the loading spinner during reload when search has no matches', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(reloadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    const searchInput = await screen.findByRole('textbox', { name: /search registry packages/i })
    await user.type(searchInput, 'no-match-query')

    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 1 packages')).toBeInTheDocument()
  })
})
