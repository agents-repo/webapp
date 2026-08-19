import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export const REGISTRY_INDEXED_DB_NAME = 'agents-repo-webapp-registry'
export const REGISTRY_INDEXED_DB_VERSION = 1

export const REGISTRY_CACHE_STORES = {
  catalog: 'catalog',
  packageDetail: 'package-detail',
  tags: 'tags',
  chatManifest: 'chat-manifest',
  chatMarkdown: 'chat-markdown',
} as const

export type RegistryCacheStoreName = (typeof REGISTRY_CACHE_STORES)[keyof typeof REGISTRY_CACHE_STORES]

export const LOCAL_STORAGE_CATALOG_CACHE_KEY = 'registry.catalog.cache.v1'
export const LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY = 'registry.package-detail.cache.v1'
export const LOCAL_STORAGE_TAG_LIST_CACHE_KEY = 'registry.tags.cache.v1'

export interface PersistentCacheEntry<TEnvelope> {
  readonly key: string
  readonly envelope: TEnvelope
}

export interface PersistentCacheBackend<TEnvelope> {
  listAll(): Promise<TEnvelope[]>
  replaceAll(entries: readonly PersistentCacheEntry<TEnvelope>[]): Promise<void>
  clear(): Promise<void>
}

interface RegistryCacheDbSchema extends DBSchema {
  catalog: { key: string; value: unknown }
  'package-detail': { key: string; value: unknown }
  tags: { key: string; value: unknown }
  'chat-manifest': { key: string; value: unknown }
  'chat-markdown': { key: string; value: unknown }
}

const STORE_NAMES: readonly RegistryCacheStoreName[] = [
  REGISTRY_CACHE_STORES.catalog,
  REGISTRY_CACHE_STORES.packageDetail,
  REGISTRY_CACHE_STORES.tags,
  REGISTRY_CACHE_STORES.chatManifest,
  REGISTRY_CACHE_STORES.chatMarkdown,
]

export class MemoryCacheBackend<TEnvelope> implements PersistentCacheBackend<TEnvelope> {
  readonly #entries = new Map<string, TEnvelope>()

  listAll(): Promise<TEnvelope[]> {
    return Promise.resolve(Array.from(this.#entries.values()))
  }

  replaceAll(entries: readonly PersistentCacheEntry<TEnvelope>[]): Promise<void> {
    this.#entries.clear()

    for (const entry of entries) {
      this.#entries.set(entry.key, entry.envelope)
    }

    return Promise.resolve()
  }

  clear(): Promise<void> {
    this.#entries.clear()
    return Promise.resolve()
  }
}

const isVitest = import.meta.env?.VITEST === true || import.meta.env?.MODE === 'test'

const memoryBackends = new Map<RegistryCacheStoreName, MemoryCacheBackend<unknown>>()
const indexedDbBackends = new Map<RegistryCacheStoreName, PersistentCacheBackend<unknown>>()

let dbPromise: Promise<IDBPDatabase<RegistryCacheDbSchema> | null> | null = null
let localStorageMigrated = false

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const parseJson = (rawValue: string): unknown => {
  try {
    return JSON.parse(rawValue) as unknown
  } catch {
    return null
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

export const collectLegacyLocalStorageCatalogEntries = (): PersistentCacheEntry<Record<string, unknown>>[] => {
  const storage = getLocalStorage()
  const rawValue = storage?.getItem(LOCAL_STORAGE_CATALOG_CACHE_KEY)

  if (!rawValue) {
    return []
  }

  const parsedValue = parseJson(rawValue)

  if (!Array.isArray(parsedValue)) {
    return []
  }

  return parsedValue.flatMap((item) => {
    if (!isRecord(item) || typeof item.indexUrl !== 'string') {
      return []
    }

    return [{ key: item.indexUrl, envelope: item }]
  })
}

export const collectLegacyLocalStoragePackageDetailEntries = (): PersistentCacheEntry<
  Record<string, unknown>
>[] => {
  const storage = getLocalStorage()
  const rawValue = storage?.getItem(LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY)

  if (!rawValue) {
    return []
  }

  const parsedValue = parseJson(rawValue)

  if (!Array.isArray(parsedValue)) {
    return []
  }

  return parsedValue.flatMap((item) => {
    if (!isRecord(item) || typeof item.cacheKey !== 'string') {
      return []
    }

    return [{ key: item.cacheKey, envelope: item }]
  })
}

export const collectLegacyLocalStorageTagEntry = (): PersistentCacheEntry<Record<string, unknown>> | null => {
  const storage = getLocalStorage()
  const rawValue = storage?.getItem(LOCAL_STORAGE_TAG_LIST_CACHE_KEY)

  if (!rawValue) {
    return null
  }

  const parsedValue = parseJson(rawValue)

  if (!isRecord(parsedValue) || typeof parsedValue.repositoryKey !== 'string') {
    return null
  }

  return { key: parsedValue.repositoryKey, envelope: parsedValue }
}

const migrateLocalStorageCaches = async (db: IDBPDatabase<RegistryCacheDbSchema>): Promise<void> => {
  if (localStorageMigrated) {
    return
  }

  localStorageMigrated = true
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    const catalogEntries = collectLegacyLocalStorageCatalogEntries()
    if (catalogEntries.length > 0) {
      const tx = db.transaction(REGISTRY_CACHE_STORES.catalog, 'readwrite')
      for (const entry of catalogEntries) {
        await tx.store.put(entry.envelope, entry.key)
      }
      await tx.done
      storage.removeItem(LOCAL_STORAGE_CATALOG_CACHE_KEY)
    }

    const detailEntries = collectLegacyLocalStoragePackageDetailEntries()
    if (detailEntries.length > 0) {
      const tx = db.transaction(REGISTRY_CACHE_STORES.packageDetail, 'readwrite')
      for (const entry of detailEntries) {
        await tx.store.put(entry.envelope, entry.key)
      }
      await tx.done
      storage.removeItem(LOCAL_STORAGE_PACKAGE_DETAIL_CACHE_KEY)
    }

    const tagEntry = collectLegacyLocalStorageTagEntry()
    if (tagEntry) {
      const tx = db.transaction(REGISTRY_CACHE_STORES.tags, 'readwrite')
      await tx.store.put(tagEntry.envelope, tagEntry.key)
      await tx.done
      storage.removeItem(LOCAL_STORAGE_TAG_LIST_CACHE_KEY)
    }
  } catch {
    // Migration is best-effort; IndexedDB remains usable even if copy fails.
  }
}

const openRegistryCacheDb = async (): Promise<IDBPDatabase<RegistryCacheDbSchema> | null> => {
  if (typeof globalThis.indexedDB === 'undefined') {
    return null
  }

  if (dbPromise) {
    return dbPromise
  }

  dbPromise = openDB<RegistryCacheDbSchema>(REGISTRY_INDEXED_DB_NAME, REGISTRY_INDEXED_DB_VERSION, {
    upgrade(database) {
      for (const storeName of STORE_NAMES) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName)
        }
      }
    },
  })
    .then(async (database) => {
      await migrateLocalStorageCaches(database)
      return database
    })
    .catch(() => {
      dbPromise = Promise.resolve(null)
      return null
    })

  return dbPromise
}

const isQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false
  }

  return error.name === 'QuotaExceededError'
}

class IndexedDbCacheBackend<TEnvelope> implements PersistentCacheBackend<TEnvelope> {
  readonly #storeName: RegistryCacheStoreName
  readonly #isEnvelope: (value: unknown) => value is TEnvelope

  constructor(storeName: RegistryCacheStoreName, isEnvelope: (value: unknown) => value is TEnvelope) {
    this.#storeName = storeName
    this.#isEnvelope = isEnvelope
  }

  async listAll(): Promise<TEnvelope[]> {
    const database = await openRegistryCacheDb()

    if (!database) {
      return []
    }

    try {
      const values = await database.getAll(this.#storeName)
      return values.filter((value): value is TEnvelope => this.#isEnvelope(value))
    } catch {
      return []
    }
  }

  async replaceAll(entries: readonly PersistentCacheEntry<TEnvelope>[]): Promise<void> {
    const database = await openRegistryCacheDb()

    if (!database) {
      return
    }

    const writeEntries = async (
      records: readonly PersistentCacheEntry<TEnvelope>[],
    ): Promise<void> => {
      const tx = database.transaction(this.#storeName, 'readwrite')
      await tx.store.clear()

      for (const entry of records) {
        await tx.store.put(entry.envelope, entry.key)
      }

      await tx.done
    }

    try {
      await writeEntries(entries)
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw error
      }
    }
  }

  async clear(): Promise<void> {
    const database = await openRegistryCacheDb()

    if (!database) {
      return
    }

    try {
      const tx = database.transaction(this.#storeName, 'readwrite')
      await tx.store.clear()
      await tx.done
    } catch {
      // Ignore storage failures; clearing is best-effort.
    }
  }
}

export const getRegistryCacheBackend = <TEnvelope>(
  storeName: RegistryCacheStoreName,
  isEnvelope: (value: unknown) => value is TEnvelope,
): PersistentCacheBackend<TEnvelope> => {
  if (isVitest) {
    const existing = memoryBackends.get(storeName)

    if (existing) {
      return existing as MemoryCacheBackend<TEnvelope>
    }

    const created = new MemoryCacheBackend<TEnvelope>()
    memoryBackends.set(storeName, created)
    return created
  }

  const existing = indexedDbBackends.get(storeName)

  if (existing) {
    return existing as PersistentCacheBackend<TEnvelope>
  }

  const created = new IndexedDbCacheBackend<TEnvelope>(storeName, isEnvelope)
  indexedDbBackends.set(storeName, created)
  return created
}

export const resetRegistryCacheBackendsForTests = async (): Promise<void> => {
  for (const backend of memoryBackends.values()) {
    await backend.clear()
  }

  localStorageMigrated = false
  dbPromise = null
}
