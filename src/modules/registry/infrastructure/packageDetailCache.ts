import type { PackageDetailDocument } from '../domain/packageDetail'
import { REGISTRY_CACHE_STORES } from './indexedDbCacheBackend.ts'
import { isPackageDetailDocument } from './packageDetailValidation'
import { createPersistentLruCache } from './persistentLruCache.ts'

const CACHE_VERSION = 1
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
export const PACKAGE_DETAIL_CACHE_MAX_ENTRIES = 64

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
  storeName: REGISTRY_CACHE_STORES.packageDetail,
  maxEntries: PACKAGE_DETAIL_CACHE_MAX_ENTRIES,
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

export const readFreshPackageDetailCache = async (
  cacheKey: string,
): Promise<PackageDetailDocument | null> => {
  const envelope = await packageDetailCache.get(cacheKey)

  if (!envelope || !packageDetailCache.isFresh(envelope.cachedAt)) {
    return null
  }

  return envelope.detail
}

export const writePackageDetailCache = async (
  cacheKey: string,
  detail: PackageDetailDocument,
): Promise<void> => {
  await packageDetailCache.write(cacheKey, {
    cacheVersion: CACHE_VERSION,
    cachedAt: Date.now(),
    cacheKey,
    detail,
  })
}

export const clearRegistryPackageDetailCache = async (): Promise<void> => {
  await packageDetailCache.clear()
}

export const resetRegistryPackageDetailCacheForTests = async (): Promise<void> => {
  await clearRegistryPackageDetailCache()
}
