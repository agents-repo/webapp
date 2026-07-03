import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistryCatalog, RegistryPackage } from '../domain/package'
import { loadRegistryCatalog } from './registryRepository'
import * as registrySourceConfig from './registrySourceConfig'
import { writeCatalogCache, resetRegistryCatalogCacheForTests } from './registryCatalogCache'

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

const makeTestPackage = (id: string, name: string, description: string, latest: string): RegistryPackage => ({
  id: `agents-repo/${id}`,
  namespace: 'agents-repo',
  package: id,
  name,
  description,
  owner: 'agents-repo',
  latest,
  tags: [],
  status: 'active',
  category: 'assistant',
  estimateOverallCost: { band: 'low' },
})

describe('loadRegistryCatalog cache integration', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    resetRegistryCatalogCacheForTests()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serves a fresh localStorage catalog when fetch source resolution fails', async () => {
    const cachedCatalog: RegistryCatalog = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [makeTestPackage('demo', 'Demo', 'Demo package', '1.0.0')],
    }

    writeCatalogCache(
      'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0',
      cachedCatalog,
    )

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockRejectedValue(
      new Error('Registry tag listing failed (503 Service Unavailable)'),
    )

    vi.spyOn(registrySourceConfig, 'getRegistrySourceConfig').mockReturnValue({
      sourceUrl: 'https://registry-proxy.example.workers.dev?ref=1.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: 'https://registry-proxy.example.workers.dev?ref=1.x',
      baseUrl: 'https://registry-proxy.example.workers.dev/?ref=1.x',
      indexPath: 'packages/index.json',
      indexUrl: 'https://registry-proxy.example.workers.dev/packages/index.json?ref=1.x',
      sourceMode: 'runtime-override',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: null,
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    const result = await loadRegistryCatalog()

    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('fresh')
    expect(result.indexUrl).toBe(
      'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0',
    )
    expect(result.baseUrlRefResolution).toEqual({ alias: '1.x', resolvedRef: 'v1.2.0' })
  })

  it('serves a fresh raw GitHub localStorage catalog when fetch source resolution fails', async () => {
    const cachedCatalog: RegistryCatalog = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [makeTestPackage('demo', 'Demo', 'Demo package', '1.0.0')],
    }

    writeCatalogCache(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.0.0/packages/index.json',
      cachedCatalog,
    )

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockRejectedValue(
      new Error('Registry tag listing failed (503 Service Unavailable)'),
    )

    vi.spyOn(registrySourceConfig, 'getRegistrySourceConfig').mockReturnValue({
      sourceUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      configuredBaseUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://raw.githubusercontent.com/agents-repo/registry/v2.x',
      indexPath: 'packages/index.json',
      indexUrl: 'https://raw.githubusercontent.com/agents-repo/registry/v2.x/packages/index.json',
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: null,
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    const result = await loadRegistryCatalog()

    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('fresh')
    expect(result.indexUrl).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.0.0/packages/index.json',
    )
    expect(result.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
  })

  it('does not serve a different-ref catalog when fetch source resolution fails', async () => {
    const mainCatalog: RegistryCatalog = {
      schemaVersion: '1.3.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [makeTestPackage('main-only', 'Main Only', 'Cached from main branch', '9.9.9')],
    }

    writeCatalogCache(
      'https://raw.githubusercontent.com/agents-repo/registry/main/packages/index.json',
      mainCatalog,
    )

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockRejectedValue(
      new Error('Registry tag listing failed (503 Service Unavailable)'),
    )

    vi.spyOn(registrySourceConfig, 'getRegistrySourceConfig').mockReturnValue({
      sourceUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      configuredBaseUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://raw.githubusercontent.com/agents-repo/registry/v2.x',
      indexPath: 'packages/index.json',
      indexUrl: 'https://raw.githubusercontent.com/agents-repo/registry/v2.x/packages/index.json',
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: null,
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    const result = await loadRegistryCatalog()

    expect(result.catalog).toBeNull()
    expect(result.cacheState).toBe('none')
    expect(result.baseUrlRefResolution).toBeNull()
    expect(result.errorMessage).toBe('Registry tag listing failed (503 Service Unavailable)')
  })
})
