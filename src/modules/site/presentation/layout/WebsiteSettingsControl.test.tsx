import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import WebsiteSettingsControl from './WebsiteSettingsControl'

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

const {
  mockValidateRegistrySourceUrlForMajorVersionAlias,
  mockResolveRegistrySourceConfig,
  mockSetStoredRegistryBaseUrlOverride,
  mockClearRegistryTagListCache,
} = vi.hoisted(() => ({
  mockValidateRegistrySourceUrlForMajorVersionAlias: vi.fn(),
  mockResolveRegistrySourceConfig: vi.fn(),
  mockSetStoredRegistryBaseUrlOverride: vi.fn(),
  mockClearRegistryTagListCache: vi.fn(),
}))

vi.mock('../../../registry/application/registrySource', async () => {
  const actual = await vi.importActual('../../../registry/application/registrySource')

  return {
    ...actual,
    validateRegistrySourceUrlForMajorVersionAlias: mockValidateRegistrySourceUrlForMajorVersionAlias,
    resolveRegistrySourceConfig: mockResolveRegistrySourceConfig,
    setStoredRegistryBaseUrlOverride: mockSetStoredRegistryBaseUrlOverride,
    clearRegistryTagListCache: mockClearRegistryTagListCache,
  }
})

const resolvedSource = {
  baseUrl: 'https://example.com/runtime',
  githubRepositoryUrl: 'https://github.com/agents-repo/registry',
  sourceMode: 'runtime-override' as const,
  githubRepositorySourceMode: 'configured' as const,
  baseUrlRefResolution: null,
  githubRepositoryRefResolution: null,
}

describe('WebsiteSettingsControl save flow', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    mockValidateRegistrySourceUrlForMajorVersionAlias.mockResolvedValue(null)
    mockResolveRegistrySourceConfig.mockResolvedValue(resolvedSource)
    mockSetStoredRegistryBaseUrlOverride.mockImplementation(() => {})
    mockClearRegistryTagListCache.mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('persists a valid registry base URL override after alias validation succeeds', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()

    renderWithProviders(<WebsiteSettingsControl onSaved={onSaved} />)

    await user.click(screen.getByRole('button', { name: 'Open website settings' }))
    await user.type(
      screen.getByLabelText('Registry base URL override'),
      'https://example.com/runtime/',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(mockValidateRegistrySourceUrlForMajorVersionAlias).toHaveBeenCalled()
      expect(mockSetStoredRegistryBaseUrlOverride).toHaveBeenCalledWith('https://example.com/runtime/')
      expect(mockClearRegistryTagListCache).toHaveBeenCalled()
      expect(mockResolveRegistrySourceConfig).toHaveBeenCalled()
      expect(onSaved).toHaveBeenCalled()
    })
  })

  it('shows synchronous validation errors without calling alias validation', async () => {
    const user = userEvent.setup()

    renderWithProviders(<WebsiteSettingsControl />)

    await user.click(screen.getByRole('button', { name: 'Open website settings' }))
    await user.type(screen.getByLabelText('Registry base URL override'), 'not-a-valid-url')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Enter a valid HTTP or HTTPS URL.')).toBeInTheDocument()
    expect(mockValidateRegistrySourceUrlForMajorVersionAlias).not.toHaveBeenCalled()
    expect(mockSetStoredRegistryBaseUrlOverride).not.toHaveBeenCalled()
  })

  it('surfaces alias validation errors returned from registry source checks', async () => {
    const user = userEvent.setup()
    mockValidateRegistrySourceUrlForMajorVersionAlias.mockResolvedValue(
      'No stable release tag found for major version line 1.x in agents-repo/registry',
    )

    renderWithProviders(<WebsiteSettingsControl />)

    await user.click(screen.getByRole('button', { name: 'Open website settings' }))
    await user.type(
      screen.getByLabelText('Registry base URL override'),
      'https://github.com/agents-repo/registry/tree/v1.x',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText(
        'No stable release tag found for major version line 1.x in agents-repo/registry',
      ),
    ).toBeInTheDocument()
    expect(mockSetStoredRegistryBaseUrlOverride).not.toHaveBeenCalled()
  })
})
