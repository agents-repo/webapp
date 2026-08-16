import type { PackageDetailDocument } from '../domain/packageDetail'
import { isPackageDetailDocument } from './packageDetailValidation'

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

class PackageDetailLruCache {
  readonly #entries = new Map<string, PackageDetailCacheEnvelope>()

  get(cacheKey: string): PackageDetailCacheEnvelope | undefined {
    const entry = this.#entries.get(cacheKey)

    if (!entry) {
      return undefined
    }

    this.#entries.delete(cacheKey)
    this.#entries.set(cacheKey, entry)

    return entry
  }

  set(cacheKey: string, envelope: PackageDetailCacheEnvelope): void {
    if (this.#entries.has(cacheKey)) {
      this.#entries.delete(cacheKey)
    }

    this.#entries.set(cacheKey, envelope)

    while (this.#entries.size > CACHE_MAX_ENTRIES) {
      const oldestKey = this.#entries.keys().next().value

      if (oldestKey === undefined) {
        break
      }

      this.#entries.delete(oldestKey)
    }
  }

  values(): IterableIterator<PackageDetailCacheEnvelope> {
    return this.#entries.values()
  }

  clear(): void {
    this.#entries.clear()
  }
}

const memoryCache = new PackageDetailLruCache()

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

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const loadPersistentCache = (): PackageDetailCacheEnvelope[] => {
  const storage = getLocalStorage()

  if (!storage) {
    return []
  }

  try {
    const rawValue = storage.getItem(CACHE_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter((item) => isEnvelope(item))
  } catch {
    return []
  }
}

const persistCache = (): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Array.from(memoryCache.values())))
  } catch {
    // Ignore quota and serialization errors; caching is best-effort only.
  }
}

const getEnvelopeFromMemoryOrStorage = (cacheKey: string): PackageDetailCacheEnvelope | null => {
  const memoryValue = memoryCache.get(cacheKey)

  if (memoryValue) {
    return memoryValue
  }

  const persistentEntries = loadPersistentCache()

  if (persistentEntries.length === 0) {
    return null
  }

  for (const entry of persistentEntries) {
    memoryCache.set(entry.cacheKey, entry)
  }

  return memoryCache.get(cacheKey) ?? null
}

const isFresh = (cachedAt: number): boolean => {
  return Date.now() - cachedAt <= CACHE_TTL_MS
}

export const buildPackageDetailCacheKey = (
  detailUrl: string,
  packageRef: string,
  latest: string,
): string => {
  return `${detailUrl}#${packageRef}@${latest}`
}

export const readFreshPackageDetailCache = (cacheKey: string): PackageDetailDocument | null => {
  const envelope = getEnvelopeFromMemoryOrStorage(cacheKey)

  if (!envelope || !isFresh(envelope.cachedAt)) {
    return null
  }

  return envelope.detail
}

export const writePackageDetailCache = (cacheKey: string, detail: PackageDetailDocument): void => {
  memoryCache.set(cacheKey, {
    cacheVersion: CACHE_VERSION,
    cachedAt: Date.now(),
    cacheKey,
    detail,
  })

  persistCache()
}

export const clearRegistryPackageDetailCache = (): void => {
  memoryCache.clear()

  const storage = getLocalStorage()

  if (storage) {
    try {
      storage.removeItem(CACHE_STORAGE_KEY)
    } catch {
      // Ignore storage failures; clearing is best-effort only.
    }
  }
}

export const resetRegistryPackageDetailCacheForTests = (): void => {
  clearRegistryPackageDetailCache()
}
