import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { loadedCatalogContext } from '../../../../test/fixtures/homePageTestFixtures'
import { PackageCard } from './PackageCard'

vi.mock('../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

describe('PackageCard', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows inline install command and search match context', async () => {
    useRegistryCatalogMock.mockReturnValue(loadedCatalogContext)
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const pkg = sampleRegistryCatalog.packages[0]

    renderWithProviders(
      <PackageCard
        pkg={pkg}
        registryBaseUrl="https://example.com/registry"
        onFilterByOwner={() => {}}
        searchMatchContext={{ fields: ['description'], descriptionSnippet: 'accessibility testing' }}
      />,
    )

    expect(screen.getByText(/Matched in: description/i)).toBeInTheDocument()
    expect(screen.getByText(/accessibility testing/i)).toBeInTheDocument()

    const inlineInstallWrapper = screen.getByText('npx agents-repo install agents-repo/sample-agent').closest(
      '.package-card-inline-install',
    )
    expect(inlineInstallWrapper).toHaveClass('d-none')
    expect(inlineInstallWrapper).toHaveClass('d-md-block')
    expect(inlineInstallWrapper).toHaveTextContent('npx agents-repo install agents-repo/sample-agent')

    await user.click(
      screen.getByRole('button', { name: 'Copy install command for sample-agent' }),
    )
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('npx agents-repo install agents-repo/sample-agent')
    })
  })
})
