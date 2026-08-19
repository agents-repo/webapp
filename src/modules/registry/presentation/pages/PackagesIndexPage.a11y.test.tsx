import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackagesIndexPage from './PackagesIndexPage'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('PackagesIndexPage accessibility', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('has no detectable accessibility violations', async () => {
    const user = userEvent.setup()
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)

    const { container } = renderWithProviders(<PackagesIndexPage setHeaderSearchSlot={() => {}} />)
    await screen.findByRole('heading', { name: 'sample-agent' })

    const closedResults = await axe(container, axeOptions)
    expect(closedResults.violations).toHaveLength(0)
    expect(document.querySelector('#sidebar-category-agent')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    const dialog = await screen.findByRole('dialog', { name: 'Filters' })
    expect(document.querySelector('#offcanvas-category-agent')).not.toBeNull()
    const openResults = await axe(dialog, axeOptions)
    expect(openResults.violations).toHaveLength(0)
  })
})
