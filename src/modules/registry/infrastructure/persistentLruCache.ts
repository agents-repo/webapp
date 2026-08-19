import {
  getRegistryCacheBackend,
  type PersistentCacheBackend,
  type PersistentCacheEntry,
  type RegistryCacheStoreName,
} from './indexedDbCacheBackend.ts'

export class LruCache<T> {
  readonly #entries = new Map<string, T>()
  readonly #maxEntries: number

  constructor(maxEntries: number) {
    this.#maxEntries = maxEntries
  }

  get(key: string): T | undefined {
    const entry = this.#entries.get(key)

    if (entry === undefined) {
      return undefined
    }

    this.#entries.delete(key)
    this.#entries.set(key, entry)

    return entry
  }

  set(key: string, value: T): void {
    if (this.#entries.has(key)) {
      this.#entries.delete(key)
    }

    this.#entries.set(key, value)

    while (this.#entries.size > this.#maxEntries) {
      const oldestKey = this.#entries.keys().next().value

      if (oldestKey === undefined) {
        break
      }

      this.#entries.delete(oldestKey)
    }
  }

  evictOldest(): string | undefined {
    const oldestKey = this.#entries.keys().next().value

    if (oldestKey === undefined) {
      return undefined
    }

    this.#entries.delete(oldestKey)
    return oldestKey
  }

  values(): IterableIterator<T> {
    return this.#entries.values()
  }

  clear(): void {
    this.#entries.clear()
  }
}

export interface PersistentLruCacheOptions<TEnvelope> {
  readonly storeName: RegistryCacheStoreName
  readonly maxEntries: number
  readonly ttlMs: number | null
  readonly getKey: (envelope: TEnvelope) => string
  readonly isEnvelope: (value: unknown) => value is TEnvelope
  readonly backend?: PersistentCacheBackend<TEnvelope>
}

export interface PersistentLruCache<TEnvelope> {
  get(key: string): Promise<TEnvelope | null>
  listAll(): Promise<TEnvelope[]>
  write(key: string, envelope: TEnvelope): Promise<void>
  clear(): Promise<void>
  isFresh(cachedAt: number): boolean
}

export const createPersistentLruCache = <TEnvelope>(
  options: PersistentLruCacheOptions<TEnvelope>,
): PersistentLruCache<TEnvelope> => {
  const memory = new LruCache<TEnvelope>(options.maxEntries)
  const backend = options.backend ?? getRegistryCacheBackend(options.storeName, options.isEnvelope)
  let hydrated = false
  let exclusive: Promise<void> = Promise.resolve()

  const runExclusive = async <T>(operation: () => Promise<T>): Promise<T> => {
    const run = exclusive.then(operation, operation)
    exclusive = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }

  const hydrateEntries = (persistentEntries: TEnvelope[]): void => {
    for (const entry of persistentEntries) {
      memory.set(options.getKey(entry), entry)
    }
  }

  const ensureHydrated = async (): Promise<void> => {
    if (hydrated) {
      return
    }

    const persistentEntries = await backend.listAll()
    hydrateEntries(persistentEntries.filter((item) => options.isEnvelope(item)))
    hydrated = true
  }

  const toPersistentEntries = (): PersistentCacheEntry<TEnvelope>[] => {
    return Array.from(memory.values()).map((envelope) => ({
      key: options.getKey(envelope),
      envelope,
    }))
  }

  const persist = async (): Promise<void> => {
    try {
      await backend.replaceAll(toPersistentEntries())
    } catch {
      if (memory.evictOldest() === undefined) {
        return
      }

      try {
        await backend.replaceAll(toPersistentEntries())
      } catch {
        // Ignore quota and serialization errors; caching is best-effort only.
      }
    }
  }

  return {
    async get(key: string): Promise<TEnvelope | null> {
      return runExclusive(async () => {
        await ensureHydrated()
        return memory.get(key) ?? null
      })
    },

    async listAll(): Promise<TEnvelope[]> {
      return runExclusive(async () => {
        await ensureHydrated()
        return Array.from(memory.values())
      })
    },

    async write(key: string, envelope: TEnvelope): Promise<void> {
      await runExclusive(async () => {
        await ensureHydrated()
        memory.set(key, envelope)
        await persist()
      })
    },

    async clear(): Promise<void> {
      await runExclusive(async () => {
        memory.clear()
        hydrated = true

        try {
          await backend.clear()
        } catch {
          // Ignore storage failures; clearing is best-effort only.
        }
      })
    },

    isFresh(cachedAt: number): boolean {
      if (options.ttlMs === null) {
        return true
      }

      return Date.now() - cachedAt <= options.ttlMs
    },
  }
}
