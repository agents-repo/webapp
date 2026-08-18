import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findRegistryPackage } from '../../application/packageSiteRoutes'
import { loadRegistryCatalog } from '../../infrastructure/registryRepository'
import { sampleCatalogLoadResult } from '../../../../test/fixtures/homePageTestFixtures'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog'
import RegistryCatalogProvider from './RegistryCatalogProvider'
import { useRegistryCatalog } from './registryCatalogContext'
import { useCatalogMembershipRecheck } from './useCatalogMembershipRecheck'

vi.mock('../../infrastructure/registryRepository', () => ({
  loadRegistryCatalog: vi.fn(),
}))

const loadRegistryCatalogMock = vi.mocked(loadRegistryCatalog)

const emptyCatalogLoadResult = {
  ...sampleCatalogLoadResult,
  catalog: {
    ...sampleRegistryCatalog,
    aliases: {},
    packages: [],
  },
}

function MembershipProbe() {
  const { catalog, isLoading } = useRegistryCatalog()
  const isMember =
    catalog !== null && findRegistryPackage(catalog, 'agents-repo', 'sample-agent') !== undefined

  useCatalogMembershipRecheck({ enabled: true, isMember })

  if (isLoading && !isMember) {
    return <p>checking</p>
  }

  return <p>{isMember ? 'found' : 'missing'}</p>
}

describe('useCatalogMembershipRecheck', () => {
  const onCatalogStatusNoteChange = vi.fn()

  beforeEach(() => {
    onCatalogStatusNoteChange.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('reloads the catalog once when the member is missing and then shows it', async () => {
    loadRegistryCatalogMock
      .mockResolvedValueOnce(emptyCatalogLoadResult)
      .mockResolvedValueOnce(sampleCatalogLoadResult)

    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <MembershipProbe />
      </RegistryCatalogProvider>,
    )

    expect(await screen.findByText('found')).toBeInTheDocument()
    expect(loadRegistryCatalogMock).toHaveBeenCalledTimes(2)
    expect(loadRegistryCatalogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        forceSourceResolution: true,
        bypassTagCache: true,
      }),
    )
  })

  it('does not reload again after a forced miss', async () => {
    loadRegistryCatalogMock.mockResolvedValue(emptyCatalogLoadResult)

    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <MembershipProbe />
      </RegistryCatalogProvider>,
    )

    expect(await screen.findByText('missing')).toBeInTheDocument()
    expect(loadRegistryCatalogMock).toHaveBeenCalledTimes(2)

    await waitFor(() => {
      expect(loadRegistryCatalogMock).toHaveBeenCalledTimes(2)
    })
  })

  it('does not force-reload when the member is already in the catalog', async () => {
    loadRegistryCatalogMock.mockResolvedValue(sampleCatalogLoadResult)

    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <MembershipProbe />
      </RegistryCatalogProvider>,
    )

    expect(await screen.findByText('found')).toBeInTheDocument()
    expect(loadRegistryCatalogMock).toHaveBeenCalledTimes(1)
    expect(loadRegistryCatalogMock.mock.calls[0]?.[0]?.forceSourceResolution).toBeUndefined()
  })

  it('does not force-reload when the catalog is unavailable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    loadRegistryCatalogMock.mockRejectedValue(new Error('simulated load failure'))

    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <MembershipProbe />
      </RegistryCatalogProvider>,
    )

    expect(await screen.findByText('missing')).toBeInTheDocument()
    expect(loadRegistryCatalogMock).toHaveBeenCalledTimes(1)
    warnSpy.mockRestore()
  })
})
