import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RegistryCatalogProvider from './RegistryCatalogProvider'
import { useRegistryCatalog } from './registryCatalogContext'
import { loadRegistryCatalog } from '../../infrastructure/registryRepository'
import { sampleCatalogLoadResult } from '../../../../test/fixtures/homePageTestFixtures'

vi.mock('../../infrastructure/registryRepository', () => ({
  loadRegistryCatalog: vi.fn(),
}))

const loadRegistryCatalogMock = vi.mocked(loadRegistryCatalog)

function CatalogConsumer() {
  const { catalog, isLoading } = useRegistryCatalog()

  if (isLoading) {
    return <p>loading</p>
  }

  return <p>{catalog?.packages[0]?.name ?? 'empty'}</p>
}

describe('RegistryCatalogProvider', () => {
  const onCatalogStatusNoteChange = vi.fn()

  beforeEach(() => {
    loadRegistryCatalogMock.mockResolvedValue(sampleCatalogLoadResult)
    onCatalogStatusNoteChange.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads the catalog on mount without forcing source resolution', async () => {
    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <CatalogConsumer />
      </RegistryCatalogProvider>,
    )

    await screen.findByText('sample-agent')

    expect(loadRegistryCatalogMock).toHaveBeenCalled()
    expect(loadRegistryCatalogMock.mock.calls.at(-1)?.[0]?.forceSourceResolution).toBeUndefined()
    expect(loadRegistryCatalogMock.mock.calls.at(-1)?.[0]?.bypassTagCache).toBeUndefined()
  })

  it('forces reload when registry settings version changes', async () => {
    const { rerender } = render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <CatalogConsumer />
      </RegistryCatalogProvider>,
    )

    await screen.findByText('sample-agent')
    const callsAfterMount = loadRegistryCatalogMock.mock.calls.length

    rerender(
      <RegistryCatalogProvider
        registrySettingsVersion={1}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <CatalogConsumer />
      </RegistryCatalogProvider>,
    )

    await waitFor(() => {
      expect(loadRegistryCatalogMock.mock.calls.length).toBeGreaterThan(callsAfterMount)
    })

    expect(loadRegistryCatalogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        forceSourceResolution: true,
        bypassTagCache: true,
      }),
    )
  })

  it('does not reload when only a child consumer remounts', async () => {
    const { rerender } = render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <CatalogConsumer key="first" />
      </RegistryCatalogProvider>,
    )

    await screen.findByText('sample-agent')
    const callsAfterMount = loadRegistryCatalogMock.mock.calls.length

    rerender(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <CatalogConsumer key="second" />
      </RegistryCatalogProvider>,
    )

    await screen.findByText('sample-agent')

    expect(loadRegistryCatalogMock.mock.calls).toHaveLength(callsAfterMount)
  })

  it('clears loading state and surfaces an error when catalog load rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    loadRegistryCatalogMock.mockRejectedValueOnce(new Error('simulated load failure'))

    function LoadingConsumer() {
      const { isLoading, errorMessage } = useRegistryCatalog()

      return (
        <p>
          {isLoading ? 'loading' : 'settled'}
          {errorMessage ? `:${errorMessage}` : ''}
        </p>
      )
    }

    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <LoadingConsumer />
      </RegistryCatalogProvider>,
    )

    await screen.findByText('settled:simulated load failure')

    expect(screen.queryByText('loading')).not.toBeInTheDocument()
    expect(onCatalogStatusNoteChange).toHaveBeenCalledWith(
      expect.objectContaining({
        summaryText: 'Registry catalog unavailable from ',
        sourceUrl: '',
      }),
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith('Registry catalog load failed:', expect.any(Error))
    warnSpy.mockRestore()
  })

  it('forces source resolution when reloadCatalog is called and coalesces in-flight reloads', async () => {
    let resolveReload: ((result: typeof sampleCatalogLoadResult) => void) | undefined
    loadRegistryCatalogMock.mockResolvedValueOnce(sampleCatalogLoadResult)
    loadRegistryCatalogMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveReload = resolve
        }),
    )

    function ReloadConsumer() {
      const { isLoading, hasCompletedForcedReload, reloadCatalog } = useRegistryCatalog()

      return (
        <div>
          <p>{isLoading ? 'loading' : 'settled'}</p>
          <p>{hasCompletedForcedReload ? 'forced' : 'not-forced'}</p>
          <button
            type="button"
            onClick={() => {
              void reloadCatalog()
              void reloadCatalog()
            }}
          >
            reload
          </button>
        </div>
      )
    }

    render(
      <RegistryCatalogProvider
        registrySettingsVersion={0}
        onCatalogStatusNoteChange={onCatalogStatusNoteChange}
      >
        <ReloadConsumer />
      </RegistryCatalogProvider>,
    )

    await screen.findByText('settled')
    expect(screen.getByText('not-forced')).toBeInTheDocument()
    const callsAfterMount = loadRegistryCatalogMock.mock.calls.length

    await userEvent.click(screen.getByRole('button', { name: 'reload' }))

    expect(loadRegistryCatalogMock.mock.calls).toHaveLength(callsAfterMount + 1)
    expect(loadRegistryCatalogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        forceSourceResolution: true,
        bypassTagCache: true,
      }),
    )
    expect(screen.getByText('loading')).toBeInTheDocument()

    resolveReload?.(sampleCatalogLoadResult)

    await screen.findByText('settled')
    expect(screen.getByText('forced')).toBeInTheDocument()
  })
})
