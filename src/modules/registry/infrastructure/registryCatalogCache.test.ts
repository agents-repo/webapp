import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistryCatalog } from '../domain/package'
import {
  readFreshCatalogCacheEnvelopeForSourceIdentity,
  resetRegistryCatalogCacheForTests,
  writeCatalogCache,
} from './registryCatalogCache'
import type { RegistrySourceCacheIdentity } from './registrySourceUrl'

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

const sampleCatalog: RegistryCatalog = {
  schemaVersion: '1.2.0',
  updatedAt: '2026-06-08T02:09:56.645Z',
  packages: [],
}

describe('registryCatalogCache source identity matching', () => {
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

  it('matches resolved major-line cache entries for the same alias', () => {
    writeCatalogCache(
      'https://raw.githubusercontent.com/agents-repo/registry/v1.2.0/packages/index.json',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: 'v1.x',
    }

    expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)?.indexUrl).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v1.2.0/packages/index.json',
    )
  })

  it('rejects cache entries from unrelated refs that share the same lookup key', () => {
    writeCatalogCache(
      'https://raw.githubusercontent.com/agents-repo/registry/main/packages/index.json',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: 'v1.x',
    }

    expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)).toBeNull()
  })

  it('rejects proxy cache entries when query refs belong to different major lines', () => {
    writeCatalogCache(
      'https://registry-proxy.example.workers.dev/packages/index.json?ref=main',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://registry-proxy.example.workers.dev/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: '1.x',
    }

    expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)).toBeNull()
  })
})
