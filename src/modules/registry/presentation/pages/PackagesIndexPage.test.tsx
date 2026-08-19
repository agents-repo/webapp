import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { clearTestStorage } from '../../../../test/testUtils'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackagesIndexPage from './PackagesIndexPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'
import { filterableRegistryCatalog } from '../../../../test/fixtures/filterableRegistryCatalog'
import { CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY } from '../../application/catalogFilterPreferences'

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

function LocationSearch() {
  const location = useLocation()
  return <div data-testid="location-search">{location.search}</div>
}

describe('PackagesIndexPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    clearTestStorage()
  })

  it('uses a distinct heading from Home and links cards to package pages', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />)

    expect(screen.getByRole('heading', { name: 'All packages', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/narrow results with filters/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'sample-agent' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View sample-agent' })).toHaveAttribute(
      'href',
      '/packages/agents-repo/sample-agent/',
    )
  })

  it('uses unique filter control ids for the sidebar and offcanvas copies', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />)
    await screen.findByRole('heading', { name: 'sample-agent' })

    expect(document.querySelector('#sidebar-category-agent')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await screen.findByRole('dialog', { name: 'Filters' })
    expect(document.querySelector('#offcanvas-category-agent')).not.toBeNull()
    expect(document.querySelector('#sidebar-category-agent')).not.toBe(
      document.querySelector('#offcanvas-category-agent'),
    )
  })

  it('hides yanked packages and scopes the results summary', async () => {
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: filterableRegistryCatalog,
    })

    renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />, {
      initialEntries: ['/packages'],
    })

    expect(await screen.findByRole('heading', { name: 'review-agent' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'plan-flow' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'yanked-agent' })).not.toBeInTheDocument()
    expect(screen.getByText('Showing 3 of 3 packages')).toBeInTheDocument()
  })

  it('restores filters from the URL and updates counts when a tag is selected', async () => {
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: filterableRegistryCatalog,
    })

    renderWithProviders(
      <>
        <LocationSearch />
        <PackagesIndexPage setHeaderSearchSlot={() => {}} />
      </>,
      { initialEntries: ['/packages?tag=shared'] },
    )

    expect(await screen.findByRole('heading', { name: 'review-agent' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'plan-flow' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'legacy-helper' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location-search')).toHaveTextContent('tag=shared')
    expect(screen.getAllByRole('checkbox', { name: 'automation (1)' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('checkbox', { name: 'assistant (1)' }).length).toBeGreaterThan(0)
  })

  it('pushes facet changes and owner filters into the URL', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: filterableRegistryCatalog,
    })

    renderWithProviders(
      <>
        <LocationSearch />
        <PackagesIndexPage setHeaderSearchSlot={() => {}} />
      </>,
      { initialEntries: ['/packages'] },
    )

    await screen.findByRole('heading', { name: 'review-agent' })
    await user.click(screen.getAllByRole('checkbox', { name: 'automation (2)' })[0])

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('category=automation')
    })
    expect(screen.queryByRole('heading', { name: 'plan-flow' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('')
    })

    await user.click(screen.getAllByRole('button', { name: 'Actions for owner agents-repo' })[0])
    await user.click(screen.getAllByRole('button', { name: 'Filter packages by this owner' })[0])
    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('q=%40agents-repo')
    })
  })

  it('toggles a category filter from a package card badge', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: filterableRegistryCatalog,
    })

    renderWithProviders(
      <>
        <LocationSearch />
        <PackagesIndexPage setHeaderSearchSlot={() => {}} />
      </>,
      { initialEntries: ['/packages'] },
    )

    await screen.findByRole('heading', { name: 'review-agent' })
    await user.click(screen.getAllByRole('button', { name: 'Toggle category filter automation' })[0])

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('category=automation')
    })
  })

  it('keeps the desktop sidebar collapsed after remount when localStorage is primed', async () => {
    localStorage.setItem(CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY, 'true')
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />)
    await screen.findByRole('heading', { name: 'sample-agent' })

    expect(screen.getByRole('button', { name: 'Show filters' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hide filters' })).not.toBeInTheDocument()
  })

  it('shows a packages-only empty message when filters match nothing', async () => {
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: filterableRegistryCatalog,
    })

    renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />, {
      initialEntries: ['/packages?category=missing'],
    })

    expect(await screen.findByText('No packages match your current search or filters.')).toBeInTheDocument()
    expect(screen.queryByText('No packages match your current search.')).not.toBeInTheDocument()
  })
})
