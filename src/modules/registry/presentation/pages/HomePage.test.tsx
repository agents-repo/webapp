import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes, useLocation } from 'react-router-dom'
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

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

function renderHomeAtRoot() {
  return renderWithProviders(
    <>
      <LocationProbe />
      <Routes>
        <Route path="/" element={<HomePage setHeaderSearchSlot={() => {}} />} />
        <Route path="/packages" element={<p>packages index</p>} />
      </Routes>
    </>,
    { initialEntries: ['/'] },
  )
}

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

  it('shows popular package cards after the catalog loads', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(await screen.findByRole('heading', { name: /Most downloaded in the last year/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View all packages' })).toHaveAttribute('href', '/packages/')
    expect(container.querySelector('details.package-download-stats-card')).not.toBeNull()
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

  it('does not show the loading spinner when catalog loading failed', () => {
    useRegistryCatalogMock.mockReturnValue(unavailableCatalogContext)

    const { container } = renderWithProviders(<HomePage setHeaderSearchSlot={() => {}} />)

    expect(screen.getByText('No catalog data available')).toBeInTheDocument()
    expect(screen.getByText('No catalog data available.')).toBeInTheDocument()
    expect(container.querySelector('.catalog-loading-spinner')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })
})

describe('HomePage search', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('navigates to the packages index after a debounced query', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderHomeAtRoot()

    const searchInput = await screen.findByRole('textbox', { name: /search registry packages/i })
    await user.type(searchInput, 'demo-flow')

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/packages/?q=demo-flow')
    })
  })

  it('navigates immediately on search submit', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderHomeAtRoot()

    const searchInput = await screen.findByRole('textbox', { name: /search registry packages/i })
    await user.type(searchInput, 'sample-agent{Enter}')

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/packages/?q=sample-agent')
    })
  })

  it('stays on home when the query is empty', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderHomeAtRoot()

    const searchInput = await screen.findByRole('textbox', { name: /search registry packages/i })
    await user.type(searchInput, '   {Enter}')

    expect(screen.getByTestId('location')).toHaveTextContent('/')
    expect(screen.getByRole('heading', { name: /Most downloaded in the last year/ })).toBeInTheDocument()
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

  it('navigates owner filters to the packages search URL', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderHomeAtRoot()

    await screen.findByRole('heading', { name: 'sample-agent' })
    await user.click(screen.getByRole('button', { name: 'Actions for owner agents-repo' }))
    await user.click(screen.getByRole('button', { name: 'Filter packages by this owner' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/packages/?q=%40agents-repo')
    })
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
