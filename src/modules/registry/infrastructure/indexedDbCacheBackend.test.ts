import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryStorage } from '../../../test/memoryStorage'
import {
  LOCAL_STORAGE_CATALOG_CACHE_KEY,
  LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY,
  LOCAL_STORAGE_TAG_LIST_CACHE_KEY,
  collectLegacyLocalStorageCatalogEntries,
  collectLegacyLocalStoragePackageDetailEntries,
  collectLegacyLocalStorageTagEntry,
} from './indexedDbCacheBackend'

const catalogEnvelope = {
  cacheVersion: 2,
  cachedAt: 1,
  indexUrl: 'https://example.test/packages/index.json',
  catalog: { schemaVersion: '1.2.0', updatedAt: '2026-01-01T00:00:00.000Z', packages: [] },
}

const detailEnvelope = {
  cacheVersion: 1,
  cachedAt: 1,
  cacheKey: 'https://example.test/packages/ns/id/detail.json::ns/id::1.0.0',
  detail: { schemaVersion: '1.0.0' },
}

const tagEnvelope = {
  cacheVersion: 3,
  cachedAt: 1,
  repositoryKey: 'agents-repo/registry',
  tagNames: ['v1.0.0'],
}

describe('legacy localStorage registry cache collectors', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('copies catalog, detail, and tag envelopes then leaves keys removable', () => {
    localStorage.setItem(LOCAL_STORAGE_CATALOG_CACHE_KEY, JSON.stringify([catalogEnvelope]))
    localStorage.setItem(LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY, JSON.stringify([detailEnvelope]))
    localStorage.setItem(LOCAL_STORAGE_TAG_LIST_CACHE_KEY, JSON.stringify(tagEnvelope))

    expect(collectLegacyLocalStorageCatalogEntries()).toEqual([
      { key: catalogEnvelope.indexUrl, envelope: catalogEnvelope },
    ])
    expect(collectLegacyLocalStoragePackageDetailEntries()).toEqual([
      { key: detailEnvelope.cacheKey, envelope: detailEnvelope },
    ])
    expect(collectLegacyLocalStorageTagEntry()).toEqual({
      key: tagEnvelope.repositoryKey,
      envelope: tagEnvelope,
    })

    localStorage.removeItem(LOCAL_STORAGE_CATALOG_CACHE_KEY)
    localStorage.removeItem(LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY)
    localStorage.removeItem(LOCAL_STORAGE_TAG_LIST_CACHE_KEY)

    expect(collectLegacyLocalStorageCatalogEntries()).toEqual([])
    expect(collectLegacyLocalStoragePackageDetailEntries()).toEqual([])
    expect(collectLegacyLocalStorageTagEntry()).toBeNull()
  })

  it('ignores malformed legacy payloads', () => {
    localStorage.setItem(LOCAL_STORAGE_CATALOG_CACHE_KEY, '{not-json')
    localStorage.setItem(LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY, JSON.stringify({ cacheKey: 'x' }))
    localStorage.setItem(LOCAL_STORAGE_TAG_LIST_CACHE_KEY, JSON.stringify({ tagNames: [] }))

    expect(collectLegacyLocalStorageCatalogEntries()).toEqual([])
    expect(collectLegacyLocalStoragePackageDetailEntries()).toEqual([])
    expect(collectLegacyLocalStorageTagEntry()).toBeNull()
  })
})
