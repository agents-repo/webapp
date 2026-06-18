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

  it('resolves default v1.x configured source without runtime overrides', async () => {
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
    expect(source.githubRepositoryRefResolution).toEqual({ alias: 'v1.x', resolvedRef: 'v1.2.0' })
    expect(source.baseUrl).toBe('https://registry-proxy.maiconfz.workers.dev/?ref=v1.2.0')
    expect(source.indexUrl).toBe('https://registry-proxy.maiconfz.workers.dev/packages/index.json?ref=v1.2.0')
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v1.2.0')
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
})
