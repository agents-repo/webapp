import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistryCatalog, RegistryPackage } from '../domain/package'
import { loadRegistryCatalog } from './registryRepository'
import * as registrySourceConfig from './registrySourceConfig'
import * as registryCatalogCache from './registryCatalogCache'

const makeTestCatalog = (schemaVersion = '1.3.0'): RegistryCatalog => ({
  schemaVersion,
  updatedAt: '2026-06-08T02:09:56.645Z',
  packages: [makeTestPackage()],
})

const makeTestPackage = (): RegistryPackage => ({
  id: 'agents-repo/demo',
  namespace: 'agents-repo',
  package: 'demo',
  name: 'Demo',
  description: 'Demo package',
  owner: 'agents-repo',
  latest: '1.0.0',
  tags: [],
  status: 'active',
  category: 'assistant',
  estimateOverallCost: { band: 'low' },
})

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
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: 'https://registry-proxy.example.workers.dev?ref=1.x',
      baseUrl: 'https://registry-proxy.example.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'runtime-override',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
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

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCacheEnvelopeForSourceIdentity').mockReturnValue(null)
    vi.spyOn(registryCatalogCache, 'readStaleCatalogCacheEnvelopeForSourceIdentity').mockReturnValue(null)

    const result = await loadRegistryCatalog()

    expect(result.catalog).toBeNull()
    expect(result.errorMessage).toBe(
      'Could not infer a GitHub repository for major-version line ref resolution.',
    )
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.x')
    expect(result.baseUrlRefResolution).toBeNull()
    expect(result.githubRepositoryRefResolution).toBeNull()
  })

  it('returns a cached catalog with stale-fallback cache state when only a stale identity-matched envelope exists after fetch source resolution fails', async () => {
    const cachedIndexUrl = 'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0'
    const cachedCatalog = makeTestCatalog('1.2.0')

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

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCacheEnvelopeForSourceIdentity').mockReturnValue(null)
    vi.spyOn(registryCatalogCache, 'readStaleCatalogCacheEnvelopeForSourceIdentity').mockReturnValue({
      cacheVersion: 1,
      cachedAt: Date.now() - 48 * 60 * 60 * 1000,
      indexUrl: cachedIndexUrl,
      catalog: cachedCatalog,
    })

    vi.spyOn(globalThis, 'fetch')

    const result = await loadRegistryCatalog()

    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('stale-fallback')
    expect(result.indexUrl).toBe(cachedIndexUrl)
    expect(result.errorMessage).toBe('Registry tag listing failed (503 Service Unavailable)')
    expect(result.baseUrlRefResolution).toEqual({ alias: '1.x', resolvedRef: 'v1.2.0' })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('returns a fresh cached catalog without network when a fresh envelope exists', async () => {
    const cachedIndexUrl = 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v2.0.0'
    const cachedCatalog = makeTestCatalog('2.0.0')

    const resolveFetchSourceConfig = vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig')

    vi.spyOn(registrySourceConfig, 'getRegistrySourceConfig').mockReturnValue({
      sourceUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.maiconfz.workers.dev/?ref=v2.0.0',
      indexPath: 'packages/index.json',
      indexUrl: cachedIndexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: null,
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCacheEnvelopeForSourceIdentity').mockReturnValue({
      cacheVersion: 1,
      cachedAt: Date.now(),
      indexUrl: cachedIndexUrl,
      catalog: cachedCatalog,
    })

    vi.spyOn(globalThis, 'fetch')

    const result = await loadRegistryCatalog()

    expect(resolveFetchSourceConfig).not.toHaveBeenCalled()
    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('fresh')
    expect(result.indexUrl).toBe(cachedIndexUrl)
    expect(result.registryBaseUrl).toBe('https://registry-proxy.maiconfz.workers.dev/?ref=v2.0.0')
    expect(result.errorMessage).toBeUndefined()
    expect(result.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.0.0')
    expect(result.githubRepositoryRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('returns a fresh cached catalog with error when forced resolution fails but envelope exists', async () => {
    const cachedIndexUrl = 'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0'
    const cachedCatalog = makeTestCatalog('1.2.0')

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

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCacheEnvelopeForSourceIdentity').mockReturnValue({
      cacheVersion: 1,
      cachedAt: Date.now(),
      indexUrl: cachedIndexUrl,
      catalog: cachedCatalog,
    })

    vi.spyOn(globalThis, 'fetch')

    const result = await loadRegistryCatalog({ forceSourceResolution: true })

    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('fresh')
    expect(result.indexUrl).toBe(cachedIndexUrl)
    expect(result.registryBaseUrl).toBe('https://registry-proxy.example.workers.dev/?ref=v1.2.0')
    expect(result.errorMessage).toBe('Registry tag listing failed (503 Service Unavailable)')
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.x')
    expect(result.baseUrlRefResolution).toEqual({ alias: '1.x', resolvedRef: 'v1.2.0' })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('fetches from the network when forced resolution is requested even if indexUrl cache is warm', async () => {
    const indexUrl = 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v1.2.0'
    const cachedCatalog = makeTestCatalog('1.2.0')
    const networkCatalog = makeTestCatalog('1.3.0')

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCacheEnvelopeForSourceIdentity').mockReturnValue(null)

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.maiconfz.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: 'v2.x', resolvedRef: 'v2.0.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(cachedCatalog)
    vi.spyOn(registryCatalogCache, 'readCatalogCacheEnvelope').mockReturnValue(null)

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(networkCatalog), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await loadRegistryCatalog({ forceSourceResolution: true })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.catalog).toEqual(networkCatalog)
    expect(result.cacheState).toBe('none')
  })

  it('returns a fresh cached catalog when browse resolution fails after forced resolution', async () => {
    const indexUrl = 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v1.2.0'
    const cachedCatalog = makeTestCatalog('1.2.0')

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCacheEnvelopeForSourceIdentity').mockReturnValue(null)

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.maiconfz.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: 'v2.x', resolvedRef: 'v2.0.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(cachedCatalog)
    vi.spyOn(globalThis, 'fetch')

    const result = await loadRegistryCatalog()

    expect(result.catalog).toEqual(cachedCatalog)
    expect(result.cacheState).toBe('fresh')
    expect(result.errorMessage).toBeUndefined()
    expect(result.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.x')
    expect(result.githubRepositoryRefResolution).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('skips conditional headers for cross-origin catalog refresh', async () => {
    const indexUrl = 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v1.2.0'
    const staleCatalog = makeTestCatalog()

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.maiconfz.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: 'v2.x', resolvedRef: 'v2.0.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(null)
    vi.spyOn(registryCatalogCache, 'readCatalogCacheEnvelope').mockReturnValue({
      cacheVersion: 1,
      cachedAt: Date.now(),
      indexUrl,
      catalog: staleCatalog,
      etag: '"abc123"',
    })

    const locationDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'location')
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { origin: 'https://agents-repo.org' },
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(staleCatalog), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ETag: '"abc123"' },
      }),
    )

    try {
      const result = await loadRegistryCatalog()

      expect(result.catalog).toEqual(staleCatalog)
      expect(result.cacheState).toBe('none')
      expect(fetchMock).toHaveBeenCalledWith(
        indexUrl,
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        }),
      )
    } finally {
      if (locationDescriptor) {
        Object.defineProperty(globalThis, 'location', locationDescriptor)
      } else {
        Reflect.deleteProperty(globalThis, 'location')
      }
    }
  })

  it('sends conditional headers for same-origin catalog refresh', async () => {
    const indexUrl = 'https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0'
    const staleCatalog = makeTestCatalog()

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.example.workers.dev?ref=1.x',
      configuredBaseUrl: 'https://registry-proxy.example.workers.dev?ref=1.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.example.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: '1.x', resolvedRef: 'v1.2.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockResolvedValue({
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(null)
    vi.spyOn(registryCatalogCache, 'readCatalogCacheEnvelope').mockReturnValue({
      cacheVersion: 1,
      cachedAt: Date.now(),
      indexUrl,
      catalog: staleCatalog,
      etag: '"abc123"',
    })
    vi.spyOn(registryCatalogCache, 'touchCatalogCache').mockImplementation(() => {})

    const locationDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'location')
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { origin: 'https://registry-proxy.example.workers.dev' },
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 304 }))

    try {
      const result = await loadRegistryCatalog()

      expect(result.catalog).toEqual(staleCatalog)
      expect(result.cacheState).toBe('fresh')
      expect(fetchMock).toHaveBeenCalledWith(
        indexUrl,
        expect.objectContaining({
          headers: {
            Accept: 'application/json',
            'If-None-Match': '"abc123"',
          },
        }),
      )
    } finally {
      if (locationDescriptor) {
        Object.defineProperty(globalThis, 'location', locationDescriptor)
      } else {
        Reflect.deleteProperty(globalThis, 'location')
      }
    }
  })

  it('returns stale fallback when network fetch fails and browse metadata rejects', async () => {
    const indexUrl = 'https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v1.2.0'
    const staleCatalog = makeTestCatalog()

    vi.spyOn(registrySourceConfig, 'resolveRegistryFetchSourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v2.x',
      runtimeBaseUrlOverride: null,
      baseUrl: 'https://registry-proxy.maiconfz.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'configured',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: 'v2.x', resolvedRef: 'v2.0.0' },
      githubRepositoryRefResolution: null,
    })

    vi.spyOn(registrySourceConfig, 'resolveRegistryBrowseSourceMetadata').mockRejectedValue(
      new Error('GitHub browse tag resolution failed'),
    )

    vi.spyOn(registryCatalogCache, 'readFreshCatalogCache').mockReturnValue(null)
    vi.spyOn(registryCatalogCache, 'readCatalogCacheEnvelope').mockReturnValue({
      cacheVersion: 1,
      cachedAt: Date.now(),
      indexUrl,
      catalog: staleCatalog,
      etag: '"abc123"',
    })

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Registry request failed (503 Service Unavailable)'))

    const result = await loadRegistryCatalog()

    expect(result.catalog).toEqual(staleCatalog)
    expect(result.cacheState).toBe('stale-fallback')
    expect(result.errorMessage).toBe('Registry request failed (503 Service Unavailable)')
    expect(result.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.x')
    expect(result.githubRepositoryRefResolution).toBeNull()
  })
})
