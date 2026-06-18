import type { RegistryCatalog } from '../domain/package'
import { isRegistryCatalog } from './registryCatalogValidation'
import { trimTrailingSlashes } from './registrySourceUrl'

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

class RegistryCatalogLruCache {
  readonly #entries = new Map<string, RegistryCatalogCacheEnvelope>()

  get(indexUrl: string): RegistryCatalogCacheEnvelope | undefined {
    const entry = this.#entries.get(indexUrl)

    if (!entry) {
      return undefined
    }

    this.#entries.delete(indexUrl)
    this.#entries.set(indexUrl, entry)

    return entry
  }

  set(indexUrl: string, envelope: RegistryCatalogCacheEnvelope): void {
    if (this.#entries.has(indexUrl)) {
      this.#entries.delete(indexUrl)
    }

    this.#entries.set(indexUrl, envelope)

    while (this.#entries.size > CACHE_MAX_ENTRIES) {
      const oldestKey = this.#entries.keys().next().value

      if (oldestKey === undefined) {
        break
      }

      this.#entries.delete(oldestKey)
    }
  }

  values(): IterableIterator<RegistryCatalogCacheEnvelope> {
    return this.#entries.values()
  }
}

const memoryCacheByIndexUrl = new RegistryCatalogLruCache()

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

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const loadPersistentCache = (): RegistryCatalogCacheEnvelope[] => {
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
    storage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Array.from(memoryCacheByIndexUrl.values())))
  } catch {
    // Ignore quota and serialization errors; caching is best-effort only.
  }
}

const getEnvelopeFromMemoryOrStorage = (indexUrl: string): RegistryCatalogCacheEnvelope | null => {
  const memoryValue = memoryCacheByIndexUrl.get(indexUrl)

  if (memoryValue) {
    return memoryValue
  }

  const persistentEntries = loadPersistentCache()

  if (persistentEntries.length === 0) {
    return null
  }

  for (const entry of persistentEntries) {
    memoryCacheByIndexUrl.set(entry.indexUrl, entry)
  }

  return memoryCacheByIndexUrl.get(indexUrl) ?? null
}

const isFresh = (cachedAt: number): boolean => {
  return Date.now() - cachedAt <= CACHE_TTL_MS
}

export interface RegistryCatalogCacheSourceIdentity {
  origin: string
  indexPathname: string
}

const listAllCatalogCacheEnvelopes = (): RegistryCatalogCacheEnvelope[] => {
  const persistentEntries = loadPersistentCache()

  for (const entry of persistentEntries) {
    if (!memoryCacheByIndexUrl.get(entry.indexUrl)) {
      memoryCacheByIndexUrl.set(entry.indexUrl, entry)
    }
  }

  return Array.from(memoryCacheByIndexUrl.values())
}

const envelopeMatchesSourceIdentity = (
  envelope: RegistryCatalogCacheEnvelope,
  identity: RegistryCatalogCacheSourceIdentity,
): boolean => {
  try {
    const parsed = new URL(envelope.indexUrl)

    return (
      parsed.origin === identity.origin &&
      (trimTrailingSlashes(parsed.pathname) || '/') === identity.indexPathname
    )
  } catch {
    return false
  }
}

const readCatalogCacheEnvelopeForSourceIdentity = (
  identity: RegistryCatalogCacheSourceIdentity,
  options: { freshOnly: boolean },
): RegistryCatalogCacheEnvelope | null => {
  const matchingEnvelopes = listAllCatalogCacheEnvelopes()
    .filter(
      (envelope) =>
        envelopeMatchesSourceIdentity(envelope, identity) &&
        (!options.freshOnly || isFresh(envelope.cachedAt)),
    )
    .sort((left, right) => right.cachedAt - left.cachedAt)

  return matchingEnvelopes[0] ?? null
}

export const readFreshCatalogCacheEnvelopeForSourceIdentity = (
  identity: RegistryCatalogCacheSourceIdentity,
): RegistryCatalogCacheEnvelope | null => {
  return readCatalogCacheEnvelopeForSourceIdentity(identity, { freshOnly: true })
}

export const readStaleCatalogCacheEnvelopeForSourceIdentity = (
  identity: RegistryCatalogCacheSourceIdentity,
): RegistryCatalogCacheEnvelope | null => {
  return readCatalogCacheEnvelopeForSourceIdentity(identity, { freshOnly: false })
}

export const readFreshCatalogCache = (indexUrl: string): RegistryCatalog | null => {
  const envelope = getEnvelopeFromMemoryOrStorage(indexUrl)

  if (!envelope || !isFresh(envelope.cachedAt)) {
    return null
  }

  return envelope.catalog
}

export const readCatalogCacheEnvelope = (
  indexUrl: string,
): RegistryCatalogCacheEnvelope | null => {
  return getEnvelopeFromMemoryOrStorage(indexUrl)
}

export const touchCatalogCache = (indexUrl: string): void => {
  const envelope = getEnvelopeFromMemoryOrStorage(indexUrl)

  if (!envelope) {
    return
  }

  memoryCacheByIndexUrl.set(indexUrl, { ...envelope, cachedAt: Date.now() })

  persistCache()
}

export const writeCatalogCache = (
  indexUrl: string,
  catalog: RegistryCatalog,
  etag?: string,
  lastModified?: string,
): void => {
  memoryCacheByIndexUrl.set(indexUrl, {
    cacheVersion: CACHE_VERSION,
    cachedAt: Date.now(),
    indexUrl,
    catalog,
    etag,
    lastModified,
  })

  persistCache()
}
