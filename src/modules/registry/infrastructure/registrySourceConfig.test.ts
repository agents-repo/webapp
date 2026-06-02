import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredRegistryBaseUrlOverride,
  setStoredRegistryBaseUrlOverride,
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
  })

  it('returns configured source when no runtime override exists', () => {
    const configuredSource = getConfiguredRegistrySourceConfig()
    const source = getRegistrySourceConfig()

    expect(source.sourceMode).toBe('configured')
    expect(source.runtimeBaseUrlOverride).toBeNull()
    expect(source.configuredBaseUrl).toBe('https://github.com/agents-repo/registry')
    expect(source.baseUrl).toBe(configuredSource.baseUrl)
    expect(source.baseUrl).toBe('https://raw.githubusercontent.com/agents-repo/registry/main')
    expect(source.baseUrl).not.toBe(source.configuredBaseUrl)
    expect(source.indexUrl).toBe(configuredSource.indexUrl)
  })

  it('prefers runtime override over configured source values', () => {
    setStoredRegistryBaseUrlOverride('https://example.com/runtime/')
    const source = getRegistrySourceConfig()

    expect(source.sourceMode).toBe('runtime-override')
    expect(source.runtimeBaseUrlOverride).toBe('https://example.com/runtime/')
    expect(source.baseUrl).toBe('https://example.com/runtime')
    expect(source.indexUrl).toBe('https://example.com/runtime/packages/index.json')
  })

  it('normalizes GitHub runtime override URLs to raw content URLs', () => {
    setStoredRegistryBaseUrlOverride('https://github.com/owner/repo/tree/main')
    const source = getRegistrySourceConfig()

    expect(source.baseUrl).toBe('https://raw.githubusercontent.com/owner/repo/main')
    expect(source.indexUrl).toBe('https://raw.githubusercontent.com/owner/repo/main/packages/index.json')
  })
})