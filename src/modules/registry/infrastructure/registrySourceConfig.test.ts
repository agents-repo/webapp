import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredRegistryBaseUrlOverride,
  clearStoredRegistryGitHubRepositoryUrlOverride,
  setStoredRegistryBaseUrlOverride,
  setStoredRegistryGitHubRepositoryUrlOverride,
} from '../application/registrySourceSettings'
import {
  getConfiguredRegistrySourceConfig,
  getRegistrySourceConfig,
} from './registrySourceConfig'

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

describe('registrySourceConfig', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
  })

  afterEach(() => {
    clearStoredRegistryBaseUrlOverride()
    clearStoredRegistryGitHubRepositoryUrlOverride()
  })

  it('returns configured source when no runtime override exists', () => {
    const configuredSource = getConfiguredRegistrySourceConfig()
    const source = getRegistrySourceConfig()

    expect(source.sourceMode).toBe('configured')
    expect(source.runtimeBaseUrlOverride).toBeNull()
    expect(source.configuredBaseUrl).toBe('https://registry.agents-repo.org?ref=v2.x')
    expect(source.baseUrl).toBe(configuredSource.baseUrl)
    expect(source.baseUrl).toBe('https://registry.agents-repo.org?ref=v2.x')
    expect(source.baseUrl).toBe(source.configuredBaseUrl)
    expect(source.indexUrl).toBe(configuredSource.indexUrl)
    expect(source.indexUrl).toBe('https://registry.agents-repo.org/packages/index.json?ref=v2.x')
    expect(source.githubRepositorySourceMode).toBe('configured')
    expect(source.runtimeGithubRepositoryUrlOverride).toBeNull()
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.x')
    expect(source.githubRepositoryUrl).toBe(source.configuredGithubRepositoryUrl)
  })

  it('prefers runtime override over configured source values', () => {
    setStoredRegistryBaseUrlOverride('https://example.com/runtime/')
    const source = getRegistrySourceConfig()

    expect(source.sourceMode).toBe('runtime-override')
    expect(source.runtimeBaseUrlOverride).toBe('https://example.com/runtime/')
    expect(source.baseUrl).toBe('https://example.com/runtime')
    expect(source.indexUrl).toBe('https://example.com/runtime/packages/index.json')
  })

  it.each([
    {
      override: 'https://github.com/owner/repo/tree/main',
      baseUrl: 'https://raw.githubusercontent.com/owner/repo/main',
      indexUrl: 'https://raw.githubusercontent.com/owner/repo/main/packages/index.json',
    },
    {
      override: 'https://github.com/owner/repo/tree/main/packages',
      baseUrl: 'https://raw.githubusercontent.com/owner/repo/main',
      indexUrl: 'https://raw.githubusercontent.com/owner/repo/main/packages/index.json',
    },
    {
      override: 'https://github.com/owner/repo/tree/refs/heads/feature/foo',
      baseUrl: 'https://raw.githubusercontent.com/owner/repo/feature/foo',
      indexUrl: 'https://raw.githubusercontent.com/owner/repo/feature/foo/packages/index.json',
    },
    {
      override: 'https://registry.example.workers.dev/catalog',
      baseUrl: 'https://registry.example.workers.dev/catalog',
      indexUrl: 'https://registry.example.workers.dev/catalog/packages/index.json',
    },
    {
      override: 'https://raw.githubusercontent.com/agents-repo/registry/main',
      baseUrl: 'https://raw.githubusercontent.com/agents-repo/registry/main',
      indexUrl: 'https://raw.githubusercontent.com/agents-repo/registry/main/packages/index.json',
    },
  ])('normalizes runtime override $override', ({ override, baseUrl, indexUrl }) => {
    setStoredRegistryBaseUrlOverride(override)
    const source = getRegistrySourceConfig()

    expect(source.baseUrl).toBe(baseUrl)
    expect(source.indexUrl).toBe(indexUrl)
  })

  it('prefers runtime GitHub repository override over configured GitHub repository URL', () => {
    setStoredRegistryGitHubRepositoryUrlOverride('https://github.com/owner/repo/tree/v1.1.0')
    const source = getRegistrySourceConfig()

    expect(source.githubRepositorySourceMode).toBe('runtime-override')
    expect(source.runtimeGithubRepositoryUrlOverride).toBe('https://github.com/owner/repo/tree/v1.1.0')
    expect(source.githubRepositoryUrl).toBe('https://github.com/owner/repo/tree/v1.1.0')
  })

  it('does not let fetch runtime override affect GitHub repository URL', () => {
    setStoredRegistryBaseUrlOverride('https://example.com/runtime/')
    const source = getRegistrySourceConfig()

    expect(source.sourceMode).toBe('runtime-override')
    expect(source.githubRepositorySourceMode).toBe('configured')
    expect(source.githubRepositoryUrl).toBe('https://github.com/agents-repo/registry/tree/v2.x')
  })
})