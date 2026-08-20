import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearStoredRegistryBaseUrlOverride,
  clearStoredRegistryGitHubRepositoryUrlOverride,
  setStoredRegistryBaseUrlOverride,
  setStoredRegistryGitHubRepositoryUrlOverride,
} from '../application/registrySourceSettings'
import { resolveRegistrySourceConfig } from './registrySourceConfig'

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
    const keys = [...this.data.keys()]
    return keys[index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

const getFetchInputUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') {
    return input
  }

  if (input instanceof URL) {
    return input.href
  }

  return input.url
}

const isGitHubTagsApiRequestUrl = (url: string): boolean => {
  try {
    return new URL(url).hostname === 'api.github.com'
  } catch {
    return false
  }
}

describe('resolveRegistrySourceConfig', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    vi.restoreAllMocks()
  })

  afterEach(() => {
    clearStoredRegistryBaseUrlOverride()
    clearStoredRegistryGitHubRepositoryUrlOverride()
  })

  it('resolves default v2.x configured source without runtime overrides', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = getFetchInputUrl(input)
      expect(isGitHubTagsApiRequestUrl(url)).toBe(false)

      return Promise.resolve(
        new Response(JSON.stringify([{ name: 'v2.0.0' }, { name: 'v1.2.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const source = await resolveRegistrySourceConfig()

    expect(fetchSpy).toHaveBeenCalled()
    expect(source.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(source.githubRepositoryRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(source.baseUrl).toBe('https://registry.agents-repo.org/?ref=v2.0.0')
    expect(source.indexUrl).toBe('https://registry.agents-repo.org/packages/index.json?ref=v2.0.0')
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.0.0')
  })

  it('resolves browse v2.x using proxy tag listing when fetch source is the registry proxy', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = getFetchInputUrl(input)

      if (isGitHubTagsApiRequestUrl(url)) {
        return Promise.resolve(
          new Response(JSON.stringify([{ name: 'v9.9.9' }]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }

      return Promise.resolve(
        new Response(JSON.stringify([{ name: 'v2.1.3' }, { name: 'v2.0.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const source = await resolveRegistrySourceConfig()

    expect(source.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.1.3' })
    expect(source.githubRepositoryRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.1.3' })
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.1.3')
  })

  it('resolves major-version line refs before building fetch URLs', async () => {
    setStoredRegistryBaseUrlOverride('https://registry-proxy.example.workers.dev?ref=1.x')

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([{ name: 'v1.0.0' }, { name: 'v1.2.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const source = await resolveRegistrySourceConfig()

    expect(source.baseUrlRefResolution).toEqual({ alias: '1.x', resolvedRef: 'v1.2.0' })
    expect(source.baseUrl).toBe('https://registry-proxy.example.workers.dev/?ref=v1.2.0')
    expect(source.indexUrl).toBe('https://registry-proxy.example.workers.dev/packages/index.json?ref=v1.2.0')
  })

  it('resolves GitHub browse URLs independently from fetch overrides', async () => {
    setStoredRegistryBaseUrlOverride('https://registry-proxy.example.workers.dev?ref=1.x')
    setStoredRegistryGitHubRepositoryUrlOverride('https://github.com/agents-repo/registry/tree/2.x')

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([{ name: 'v1.2.0' }, { name: 'v2.0.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const source = await resolveRegistrySourceConfig()

    expect(source.baseUrlRefResolution).toEqual({ alias: '1.x', resolvedRef: 'v1.2.0' })
    expect(source.githubRepositoryRefResolution).toEqual({ alias: '2.x', resolvedRef: 'v2.0.0' })
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.0.0')
  })

  it('reuses fetch-path tag results when browse tag listing fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = getFetchInputUrl(input)

      if (url.includes('registry.agents-repo.org')) {
        return Promise.resolve(
          new Response(JSON.stringify([{ name: 'v2.0.0' }, { name: 'v1.2.0' }]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }

      return Promise.resolve(new Response(null, { status: 503, statusText: 'Service Unavailable' }))
    })

    const source = await resolveRegistrySourceConfig()

    expect(source.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(source.indexUrl).toBe('https://registry.agents-repo.org/packages/index.json?ref=v2.0.0')
    expect(source.githubRepositoryRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.0.0' })
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.0.0')
  })

  it('resolves major-version line refs for bare GitHub repository base URL overrides', async () => {
    setStoredRegistryBaseUrlOverride('https://github.com/agents-repo/registry')

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([{ name: 'v2.0.0' }, { name: 'v2.1.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const source = await resolveRegistrySourceConfig()

    expect(source.baseUrlRefResolution).toEqual({ alias: 'v2.x', resolvedRef: 'v2.1.0' })
    expect(source.baseUrl).toBe('https://raw.githubusercontent.com/agents-repo/registry/v2.1.0')
    expect(source.indexUrl).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.1.0/packages/index.json',
    )
  })

  it('resolves major-version line refs for raw.githubusercontent.com base URL overrides', async () => {
    setStoredRegistryBaseUrlOverride('https://raw.githubusercontent.com/agents-repo/registry/v1.x')

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify([{ name: 'v1.0.0' }, { name: 'v1.2.0' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const source = await resolveRegistrySourceConfig()

    expect(source.baseUrlRefResolution).toEqual({ alias: 'v1.x', resolvedRef: 'v1.2.0' })
    expect(source.baseUrl).toBe('https://raw.githubusercontent.com/agents-repo/registry/v1.2.0')
    expect(source.indexUrl).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v1.2.0/packages/index.json',
    )
  })
})
