import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../../test/renderWithProviders'
import { loadedCatalogContext } from '../../../../../test/fixtures/homePageTestFixtures'
import type { RegistryPackage } from '../../../domain/package'
import { useRegistryCatalog } from '../../catalog/registryCatalogContext'
import { START_HERE_PACKAGE_REFS } from '../../../application/startHereCollection'
import HomeStartHereSection from './HomeStartHereSection'

vi.mock('../../catalog/registryCatalogContext', () => ({
  useRegistryCatalog: vi.fn(),
}))

const useRegistryCatalogMock = vi.mocked(useRegistryCatalog)

function makeStartHerePackage(ref: string): RegistryPackage {
  const [namespace, packageId] = ref.split('/')
  return {
    id: ref,
    namespace,
    package: packageId,
    path: `packages/${ref}`,
    name: packageId,
    description: `Description for ${packageId}`,
    owner: namespace,
    latest: '1.0.0',
    tags: ['starter'],
    status: 'active',
    category: 'assistant',
    estimateOverallCost: { band: 'low' },
    installTargets: [{ id: 'cursor', status: 'supported' }],
  }
}

describe('HomeStartHereSection', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders curated packages and links to the collection URL', async () => {
    const startHerePackages = START_HERE_PACKAGE_REFS.slice(0, 2).map(makeStartHerePackage)
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: {
        ...loadedCatalogContext.catalog!,
        packages: startHerePackages,
      },
    })

    renderWithProviders(<HomeStartHereSection />)

    expect(screen.getByRole('heading', { name: 'Start here' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'hello-agent' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View all in Start here' })).toHaveAttribute(
      'href',
      '/packages/?collection=start-here',
    )
  })

  it('renders nothing when no start-here packages are available', () => {
    useRegistryCatalogMock.mockReturnValue({
      ...loadedCatalogContext,
      catalog: {
        ...loadedCatalogContext.catalog!,
        packages: [],
      },
    })

    const { container } = renderWithProviders(<HomeStartHereSection />)
    expect(container).toBeEmptyDOMElement()
  })
})
