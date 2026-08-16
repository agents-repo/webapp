import type { PackageDetailDocument } from '../domain/packageDetail'
import { isPackageDetailDocument } from './packageDetailValidation'
import { createPersistentLruCache } from './persistentLruCache'

const CACHE_STORAGE_KEY = 'registry.package-detail.cache.v1'
const CACHE_VERSION = 1
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CACHE_MAX_ENTRIES = 20

interface PackageDetailCacheEnvelope {
  cacheVersion: number
  cachedAt: number
  cacheKey: string
  detail: PackageDetailDocument
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isEnvelope = (value: unknown): value is PackageDetailCacheEnvelope => {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.cacheVersion === CACHE_VERSION &&
    typeof value.cachedAt === 'number' &&
    typeof value.cacheKey === 'string' &&
    isPackageDetailDocument(value.detail)
  )
}

const packageDetailCache = createPersistentLruCache<PackageDetailCacheEnvelope>({
  storageKey: CACHE_STORAGE_KEY,
  maxEntries: CACHE_MAX_ENTRIES,
  ttlMs: CACHE_TTL_MS,
  getKey: (envelope) => envelope.cacheKey,
  isEnvelope,
})

export const buildPackageDetailCacheKey = (
  detailUrl: string,
  packageRef: string,
  latest: string,
): string => {
  return `${detailUrl}#${packageRef}@${latest}`
}

export const readFreshPackageDetailCache = (cacheKey: string): PackageDetailDocument | null => {
  const envelope = packageDetailCache.get(cacheKey)

  if (!envelope || !packageDetailCache.isFresh(envelope.cachedAt)) {
    return null
  }

  return envelope.detail
}

export const writePackageDetailCache = (cacheKey: string, detail: PackageDetailDocument): void => {
  packageDetailCache.write(cacheKey, {
    cacheVersion: CACHE_VERSION,
    cachedAt: Date.now(),
    cacheKey,
    detail,
  })
}

export const clearRegistryPackageDetailCache = (): void => {
  packageDetailCache.clear()
}

export const resetRegistryPackageDetailCacheForTests = (): void => {
  clearRegistryPackageDetailCache()
}
