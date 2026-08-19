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
  unavailableCatalogContext,
} from '../../../../test/fixtures/homePageTestFixtures'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog'

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
    expect(screen.queryByRole('button', { name: /Toggle category filter/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Hide filters|Show filters|Filters/ })).not.toBeInTheDocument()
  })

  it('keeps package cards visible during a settings reload', async () => {
    useRegistryCatalogMock.mockReturnValue(reloadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })

  it('shows the empty-state card during reload when search has no matches', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(reloadingCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    const searchInput = await screen.findByRole('textbox', { name: /search registry packages/i })
    await user.type(searchInput, 'no-match-query')

    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 1 packages')).toBeInTheDocument()
    expect(screen.getByText('No packages match your current search.')).toBeInTheDocument()
  })

  it('does not show the loading spinner when catalog loading failed', () => {
    useRegistryCatalogMock.mockReturnValue(unavailableCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(screen.getByText('No catalog data available')).toBeInTheDocument()
    expect(screen.getByText('No catalog data available.')).toBeInTheDocument()
    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })
})

describe('HomePage package card owner', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows the owner dropdown without a redundant namespace badge', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    const heading = await screen.findByRole('heading', { name: 'sample-agent' })

    expect(
      screen.getByRole('button', { name: 'Actions for owner agents-repo' }),
    ).toBeInTheDocument()

    const card = heading.closest('.package-card')
    const subtitle = card?.querySelector('.card-subtitle')

    expect(card).not.toBeNull()
    expect(subtitle).not.toBeNull()
    expect(subtitle?.querySelector('.badge')).toBeNull()
    expect(subtitle?.textContent).toMatch(/^by\s+agents-repo/)
  })

  it('shows Use in chat when chatWeb is true', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('button', { name: 'Use in chat for sample-agent' })).toBeInTheDocument()
  })

  it('shows short visible labels on sample-agent footer actions', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    const heading = await screen.findByRole('heading', { name: 'sample-agent' })
    const card = heading.closest('.package-card')
    const footer = card?.querySelector('.card-footer')

    expect(footer).not.toBeNull()
    expect(footer).toHaveClass('flex-wrap')
    expect(footer).toHaveClass('flex-md-nowrap')
    expect(footer).toHaveTextContent('CLI')
    expect(footer).toHaveTextContent('Use in chat')
    expect(footer).toHaveTextContent('Download')
    expect(footer).toHaveTextContent('View')
    expect(screen.getByRole('link', { name: 'View sample-agent' })).toHaveAttribute(
      'href',
      '/packages/agents-repo/sample-agent/',
    )
    expect(screen.getByRole('heading', { name: 'sample-agent' }).querySelector('a')).toHaveAttribute(
      'href',
      '/packages/agents-repo/sample-agent/',
    )
  })

  it('hides Use in chat when chatWeb is omitted', async () => {
    const catalogWithoutChatWeb = {
      ...sampleRegistryCatalog,
      packages: sampleRegistryCatalog.packages.map((pkg) => {
        const nextPackage = { ...pkg }
        delete nextPackage.chatWeb
        return nextPackage
      }),
    }

    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: catalogWithoutChatWeb,
    })

    renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use in chat for sample-agent' })).not.toBeInTheDocument()
  })
})
