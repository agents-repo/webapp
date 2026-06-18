import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

    vi.spyOn(registrySourceConfig, 'resolveRegistrySourceConfig').mockResolvedValue({
      sourceUrl: 'https://registry-proxy.example.workers.dev?ref=1.x',
      configuredBaseUrl: 'https://registry-proxy.maiconfz.workers.dev?ref=v1.x',
      runtimeBaseUrlOverride: 'https://registry-proxy.example.workers.dev?ref=1.x',
      baseUrl: 'https://registry-proxy.example.workers.dev/?ref=v1.2.0',
      indexPath: 'packages/index.json',
      indexUrl,
      sourceMode: 'runtime-override',
      configuredGithubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.x',
      runtimeGithubRepositoryUrlOverride: null,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v1.2.0',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: { alias: '1.x', resolvedRef: 'v1.2.0' },
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
})
