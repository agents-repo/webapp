import type { RegistryCatalog } from '../domain/package'
import { REGISTRY_CACHE_STORES } from './indexedDbCacheBackend.ts'
import { createPersistentLruCache } from './persistentLruCache.ts'
import { isRegistryCatalog } from './registryCatalogValidation'
import { extractRegistryRef, refsAreCompatibleForCatalogCacheFallback } from './registryMajorVersionRef'
import {
  getRegistryIndexCacheLookupKey,
  type RegistrySourceCacheIdentity,
} from './registrySourceUrl'

export const CATALOG_CACHE_MAX_ENTRIES = 5
const CACHE_VERSION = 1
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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
  storeName: REGISTRY_CACHE_STORES.catalog,
  maxEntries: CATALOG_CACHE_MAX_ENTRIES,
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

const readCatalogCacheEnvelopeForSourceIdentity = async (
  identity: RegistrySourceCacheIdentity,
  options: { freshOnly: boolean },
): Promise<RegistryCatalogCacheEnvelope | null> => {
  const matchingEnvelopes = (await catalogCache.listAll())
    .filter(
      (envelope) =>
        envelopeMatchesSourceIdentity(envelope, identity) &&
        (!options.freshOnly || catalogCache.isFresh(envelope.cachedAt)),
    )
    .sort((left, right) => right.cachedAt - left.cachedAt)

  return matchingEnvelopes[0] ?? null
}

export const readFreshCatalogCacheEnvelopeForSourceIdentity = async (
  identity: RegistrySourceCacheIdentity,
): Promise<RegistryCatalogCacheEnvelope | null> => {
  return readCatalogCacheEnvelopeForSourceIdentity(identity, { freshOnly: true })
}

export const readStaleCatalogCacheEnvelopeForSourceIdentity = async (
  identity: RegistrySourceCacheIdentity,
): Promise<RegistryCatalogCacheEnvelope | null> => {
  return readCatalogCacheEnvelopeForSourceIdentity(identity, { freshOnly: false })
}

export const readFreshCatalogCache = async (indexUrl: string): Promise<RegistryCatalog | null> => {
  const envelope = await catalogCache.get(indexUrl)

  if (!envelope || !catalogCache.isFresh(envelope.cachedAt)) {
    return null
  }

  return envelope.catalog
}

export const readCatalogCacheEnvelope = async (
  indexUrl: string,
): Promise<RegistryCatalogCacheEnvelope | null> => {
  return catalogCache.get(indexUrl)
}

export const touchCatalogCache = async (indexUrl: string): Promise<void> => {
  const envelope = await catalogCache.get(indexUrl)

  if (!envelope) {
    return
  }

  await catalogCache.write(indexUrl, { ...envelope, cachedAt: Date.now() })
}

export const writeCatalogCache = async (
  indexUrl: string,
  catalog: RegistryCatalog,
  etag?: string,
  lastModified?: string,
): Promise<void> => {
  await catalogCache.write(indexUrl, {
    cacheVersion: CACHE_VERSION,
    cachedAt: Date.now(),
    indexUrl,
    catalog,
    etag,
    lastModified,
  })
}

export const clearRegistryCatalogCache = async (): Promise<void> => {
  await catalogCache.clear()
}

export const resetRegistryCatalogCacheForTests = async (): Promise<void> => {
  await clearRegistryCatalogCache()
}
