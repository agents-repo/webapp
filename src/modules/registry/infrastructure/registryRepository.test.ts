import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistryCatalog } from '../domain/package'
import { loadRegistryCatalog } from './registryRepository'
import * as registrySourceConfig from './registrySourceConfig'
import * as registryCatalogCache from './registryCatalogCache'

describe('loadRegistryCatalog', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('includes ref resolution metadata when 304 is returned without cached catalog', async () => {
    const indexUrl = 'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0'

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.example.workers.dev?ref=1.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v1.x',
      runtimeBaseUrlOverride: 'https://registry-proxy.example.workers.dev?ref=1.x',
      baseUrl: 'https://registry-proxy.example.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'runtime-override',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: '1.x', resolvedRef: 'v1.2.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.2.0',
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(null)
    vi.spyOn(registryCatalogCache, 'readCatalogCacheEnvelope').mockReturnValue(null)

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 304 }))

    const result = await loadRegistryCatalog()

    expect(result.catalog).toBeNull()
    expect(result.errorMessage).toBe('Registry returned 304 Not Modified without cached catalog state')
    expect(result.baseUrlRefResolution).toEqual({ alias: '1.x', resolvedRef: 'v1.2.0' })
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v1.2.0')
    expect(result.githubRepositoryRefResolution).toBeNull()
  })

  it('includes github repository metadata when fetch source resolution fails', async () => {
    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockRejectedValue(
      new Error('Could not infer a GitHub repository for major-version line ref resolution.'),
    )

    vi.spyOn(registrySourceConfig, 'getRegistrySourceConfig').mockReturnValue({
      sourceUrl: 'https://registry-proxy.example.workers.dev?ref=1.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v1.x',
      runtimeBaseUrlOverride: 'https://registry-proxy.example.workers.dev?ref=1.x',
      baseUrl: 'https://registry-proxy.example.workers.dev/?ref=1.x',
      indexPath: 'packages/index.json',
      indexUrl: 'https://registry-proxy.example.workers.dev/packages/index.json?ref=1.x',
      sourceMode: 'runtime-override',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: null,
      githubRepositoryRefResolution: null,
    })

    const result = await loadRegistryCatalog()

    expect(result.catalog).toBeNull()
    expect(result.errorMessage).toBe(
      'Could not infer a GitHub repository for major-version line ref resolution.',
    )
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v1.x')
    expect(result.baseUrlRefResolution).toBeNull()
    expect(result.githubRepositoryRefResolution).toBeNull()
  })

  it('returns a fresh cached catalog when browse resolution fails', async () => {
    const indexUrl = 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v1.2.0'
    const cachedCatalog: RegistryCatalog = {
      schemaVersion: '1.2.0',
      updatedAt: '2026-06-08T02:09:56.645Z',
      packages: [
        {
          id: 'demo',
          name: 'Demo',
          description: 'Demo package',
          owner: 'agents-repo',
          latest: '1.0.0',
          tags: [],
          status: 'active',
          category: 'assistant',
          estimateOverallCost: { band: 'low' },
        },
      ],
    }

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v1.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v1.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.maiconfz.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: 'v1.x', resolvedRef: 'v1.2.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(cachedCatalog)
    vi.spyOn(globalThis, 'fetch')

    const result = await loadRegistryCatalog()

    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('fresh')
    expect(result.errorMessage).toBeUndefined()
    expect(result.baseUrlRefResolution).toEqual({ alias: 'v1.x', resolvedRef: 'v1.2.0' })
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v1.x')
    expect(result.githubRepositoryRefResolution).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
