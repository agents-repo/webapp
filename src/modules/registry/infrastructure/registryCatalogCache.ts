import type { RegistryCatalog } from '../domain/package'
import { createPersistentLruCache } from './persistentLruCache'
import { isRegistryCatalog } from './registryCatalogValidation'
import { extractRegistryRef, refsAreCompatibleForCatalogCacheFallback } from './registryMajorVersionRef'
import {
  getRegistryIndexCacheLookupKey,
  type RegistrySourceCacheIdentity,
} from './registrySourceUrl'

const CACHE_STORAGE_KEY = 'registry.catalog.cache.v1'
const CACHE_VERSION = 1
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CACHE_MAX_ENTRIES = 5

interface RegistryCatalogCacheEnvelope {
  cacheVersion: number
  cachedAt: number
  indexUrl: string
  catalog: RegistryCatalog
  etag?: string
  lastModified?: string
}

export type { RegistryCatalogCacheEnvelope }

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isEnvelope = (value: unknown): value is RegistryCatalogCacheEnvelope => {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.cacheVersion === CACHE_VERSION &&
    typeof value.cachedAt === 'number' &&
    typeof value.indexUrl === 'string' &&
    isRegistryCatalog(value.catalog)
  )
}

const catalogCache = createPersistentLruCache<RegistryCatalogCacheEnvelope>({
  storageKey: CACHE_STORAGE_KEY,
  maxEntries: CACHE_MAX_ENTRIES,
  ttlMs: CACHE_TTL_MS,
  getKey: (envelope) => envelope.indexUrl,
  isEnvelope,
})

export type { RegistrySourceCacheIdentity as RegistryCatalogCacheSourceIdentity }

const envelopeMatchesSourceIdentity = (
  envelope: RegistryCatalogCacheEnvelope,
  identity: RegistrySourceCacheIdentity,
): boolean => {
  const envelopeLookupKey = getRegistryIndexCacheLookupKey(envelope.indexUrl, identity.indexPath)

  if (envelopeLookupKey !== identity.lookupKey) {
    return false
  }

  const envelopeRef = extractRegistryRef(envelope.indexUrl)

  return refsAreCompatibleForCatalogCacheFallback(identity.sourceRef, envelopeRef)
}

const readCatalogCacheEnvelopeForSourceIdentity = (
  identity: RegistrySourceCacheIdentity,
  options: { freshOnly: boolean },
): RegistryCatalogCacheEnvelope | null => {
  const matchingEnvelopes = catalogCache
    .listAll()
    .filter(
      (envelope) =>
        envelopeMatchesSourceIdentity(envelope, identity) &&
        (!options.freshOnly || catalogCache.isFresh(envelope.cachedAt)),
    )
    .sort((left, right) => right.cachedAt - left.cachedAt)

  return matchingEnvelopes[0] ?? null
}

export const readFreshCatalogCacheEnvelopeForSourceIdentity = (
  identity: RegistrySourceCacheIdentity,
): RegistryCatalogCacheEnvelope | null => {
  return readCatalogCacheEnvelopeForSourceIdentity(identity, { freshOnly: true })
}

export const readStaleCatalogCacheEnvelopeForSourceIdentity = (
  identity: RegistrySourceCacheIdentity,
): RegistryCatalogCacheEnvelope | null => {
  return readCatalogCacheEnvelopeForSourceIdentity(identity, { freshOnly: false })
}

export const readFreshCatalogCache = (indexUrl: string): RegistryCatalog | null => {
  const envelope = catalogCache.get(indexUrl)

  if (!envelope || !catalogCache.isFresh(envelope.cachedAt)) {
    return null
  }

  return envelope.catalog
}

export const readCatalogCacheEnvelope = (
  indexUrl: string,
): RegistryCatalogCacheEnvelope | null => {
  return catalogCache.get(indexUrl)
}

export const touchCatalogCache = (indexUrl: string): void => {
  const envelope = catalogCache.get(indexUrl)

  if (!envelope) {
    return
  }

  catalogCache.write(indexUrl, { ...envelope, cachedAt: Date.now() })
}

export const writeCatalogCache = (
  indexUrl: string,
  catalog: RegistryCatalog,
  etag?: string,
  lastModified?: string,
): void => {
  catalogCache.write(indexUrl, {
    cacheVersion: CACHE_VERSION,
    cachedAt: Date.now(),
    indexUrl,
    catalog,
    etag,
    lastModified,
  })
}

export const clearRegistryCatalogCache = (): void => {
  catalogCache.clear()
}

export const resetRegistryCatalogCacheForTests = (): void => {
  clearRegistryCatalogCache()
}
