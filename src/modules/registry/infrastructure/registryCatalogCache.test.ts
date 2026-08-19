import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistryCatalog } from '../domain/package'
import {
  CATALOG_CACHE_MAX_ENTRIES,
  readCatalogCacheEnvelope,
  readFreshCatalogCache,
  readFreshCatalogCacheEnvelopeForSourceIdentity,
  readStaleCatalogCacheEnvelopeForSourceIdentity,
  resetRegistryCatalogCacheForTests,
  touchCatalogCache,
  writeCatalogCache,
} from './registryCatalogCache'
import type { RegistrySourceCacheIdentity } from './registrySourceUrl'

const sampleCatalog: RegistryCatalog = {
  schemaVersion: '1.2.0',
  updatedAt: '2026-06-08T02:09:56.645Z',
  packages: [],
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const makeIndexUrl = (index: number): string =>
  `https://registry.example.workers.dev/packages/index-${index}.json`

describe('registryCatalogCache source identity matching', () => {
  beforeEach(async () => {
    await resetRegistryCatalogCacheForTests()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('matches resolved major-line cache entries for the same alias', async () => {
    await writeCatalogCache(
      'https://raw.githubusercontent.com/agents-repo/registry/v2.0.0/packages/index.json',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: 'v2.x',
    }

    await expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)).resolves.toMatchObject({
      indexUrl: 'https://raw.githubusercontent.com/agents-repo/registry/v2.0.0/packages/index.json',
    })
  })

  it('rejects cache entries from unrelated refs that share the same lookup key', async () => {
    await writeCatalogCache(
      'https://raw.githubusercontent.com/agents-repo/registry/main/packages/index.json',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://raw.githubusercontent.com/agents-repo/registry/{ref}/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: 'v2.x',
    }

    await expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)).resolves.toBeNull()
  })

  it('rejects proxy cache entries when query refs belong to different major lines', async () => {
    await writeCatalogCache(
      'https://registry-proxy.example.workers.dev/packages/index.json?ref=main',
      sampleCatalog,
    )

    const identity: RegistrySourceCacheIdentity = {
      lookupKey: 'https://registry-proxy.example.workers.dev/packages/index.json',
      indexPath: 'packages/index.json',
      sourceRef: '1.x',
    }

    await expect(readFreshCatalogCacheEnvelopeForSourceIdentity(identity)).resolves.toBeNull()
  })
})

describe('registryCatalogCache TTL, LRU, and touch behavior', () => {
  beforeEach(async () => {
    await resetRegistryCatalogCacheForTests()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    vi.restoreAllMocks()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await resetRegistryCatalogCacheForTests()
    vi.restoreAllMocks()
  })

  it('treats cache entries older than 24 hours as stale for fresh reads', async () => {
    const indexUrl = makeIndexUrl(1)
    await writeCatalogCache(indexUrl, sampleCatalog)

    await expect(readFreshCatalogCache(indexUrl)).resolves.toEqual(sampleCatalog)

    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z').getTime() + CACHE_TTL_MS + 1)

    await expect(readFreshCatalogCache(indexUrl)).resolves.toBeNull()
    await expect(
      readStaleCatalogCacheEnvelopeForSourceIdentity({
        lookupKey: indexUrl,
        indexPath: `packages/index-1.json`,
        sourceRef: null,
      }),
    ).resolves.toMatchObject({ catalog: sampleCatalog })
  })

  it(`evicts the oldest entry when more than ${CATALOG_CACHE_MAX_ENTRIES} catalogs are cached`, async () => {
    for (let index = 1; index <= CATALOG_CACHE_MAX_ENTRIES + 1; index += 1) {
      await writeCatalogCache(makeIndexUrl(index), sampleCatalog)
    }

    await expect(readCatalogCacheEnvelope(makeIndexUrl(1))).resolves.toBeNull()
    await expect(readCatalogCacheEnvelope(makeIndexUrl(CATALOG_CACHE_MAX_ENTRIES + 1))).resolves.not.toBeNull()
  })

  it('refreshes cachedAt when touchCatalogCache is called', async () => {
    const indexUrl = makeIndexUrl(1)
    await writeCatalogCache(indexUrl, sampleCatalog)

    const initialCachedAt = (await readCatalogCacheEnvelope(indexUrl))?.cachedAt
    expect(initialCachedAt).toBe(new Date('2026-01-01T00:00:00.000Z').getTime())

    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z').getTime() + CACHE_TTL_MS + 1)
    await expect(readFreshCatalogCache(indexUrl)).resolves.toBeNull()

    await touchCatalogCache(indexUrl)

    const refreshedEnvelope = await readCatalogCacheEnvelope(indexUrl)
    expect(refreshedEnvelope?.cachedAt).toBe(
      new Date('2026-01-01T00:00:00.000Z').getTime() + CACHE_TTL_MS + 1,
    )
    await expect(readFreshCatalogCache(indexUrl)).resolves.toEqual(sampleCatalog)
    expect(refreshedEnvelope?.cachedAt).not.toBe(initialCachedAt)
  })
})
