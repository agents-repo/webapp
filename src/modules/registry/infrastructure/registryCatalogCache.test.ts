import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistryCatalog } from '../domain/package'
import {
  readCatalogCacheEnvelope,
  readFreshCatalogCache,
  readFreshCatalogCacheEnvelopeForSourceIdentity,
  readStaleCatalogCacheEnvelopeForSourceIdentity,
  resetRegistryCatalogCacheForTests,
  touchCatalogCache,
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

const CACHE_STORAGE_KEY = 'registry.catalog.cache.v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const makeIndexUrl = (index: number): string =>
  `https://registry.example.workers.dev/packages/index-${index}.json`

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
      'https://raw.githubusercontent.com/agents-repo/registry/v2.0.0/packages/index.json',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: 'v2.x',
    }

    expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)?.indexUrl).toBe(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.0.0/packages/index.json',
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
      sourceRef: 'v2.x',
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

describe('registryCatalogCache TTL, LRU, and touch behavior', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    resetRegistryCatalogCacheForTests()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetRegistryCatalogCacheForTests()
    vi.restoreAllMocks()
  })

  it('treats cache entries older than 24 hours as stale for fresh reads', () => {
    const indexUrl = makeIndexUrl(1)
    writeCatalogCache(indexUrl, sampleCatalog)

    expect(readFreshCatalogCache(indexUrl)).toEqual(sampleCatalog)

    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z').getTime() + CACHE_TTL_MS + 1)

    expect(readFreshCatalogCache(indexUrl)).toBeNull()
    expect(readStaleCatalogCacheEnvelopeForSourceIdentity({
      lookupKey: indexUrl,
      indexPath: `packages/index-1.json`,
      sourceRef: null,
    })?.catalog).toEqual(sampleCatalog)
  })

  it('evicts the oldest entry when more than five catalogs are cached', () => {
    for (let index = 1; index <= 6; index += 1) {
      writeCatalogCache(makeIndexUrl(index), sampleCatalog)
    }

    expect(readCatalogCacheEnvelope(makeIndexUrl(1))).toBeNull()
    expect(readCatalogCacheEnvelope(makeIndexUrl(6))).not.toBeNull()

    const persistedValue = localStorage.getItem(CACHE_STORAGE_KEY)
    expect(persistedValue).not.toBeNull()

    const persistedEntries = JSON.parse(persistedValue ?? '[]') as Array<{ indexUrl: string }>
    expect(persistedEntries).toHaveLength(5)
    expect(persistedEntries.map((entry) => entry.indexUrl)).not.toContain(makeIndexUrl(1))
    expect(persistedEntries.map((entry) => entry.indexUrl)).toContain(makeIndexUrl(6))
  })

  it('refreshes cachedAt when touchCatalogCache is called', () => {
    const indexUrl = makeIndexUrl(1)
    writeCatalogCache(indexUrl, sampleCatalog)

    const initialCachedAt = readCatalogCacheEnvelope(indexUrl)?.cachedAt
    expect(initialCachedAt).toBe(new Date('2026-01-01T00:00:00.000Z').getTime())

    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z').getTime() + CACHE_TTL_MS + 1)
    expect(readFreshCatalogCache(indexUrl)).toBeNull()

    touchCatalogCache(indexUrl)

    const refreshedEnvelope = readCatalogCacheEnvelope(indexUrl)
    expect(refreshedEnvelope?.cachedAt).toBe(new Date('2026-01-01T00:00:00.000Z').getTime() + CACHE_TTL_MS + 1)
    expect(readFreshCatalogCache(indexUrl)).toEqual(sampleCatalog)
    expect(refreshedEnvelope?.cachedAt).not.toBe(initialCachedAt)
  })
})
