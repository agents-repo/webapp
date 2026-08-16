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

  values(): IterableIterator<T> {
    return this.#entries.values()
  }

  clear(): void {
    this.#entries.clear()
  }
}

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

export interface PersistentLruCacheOptions<TEnvelope> {
  readonly storageKey: string
  readonly maxEntries: number
  readonly ttlMs: number
  readonly getKey: (envelope: TEnvelope) => string
  readonly isEnvelope: (value: unknown) => value is TEnvelope
}

export interface PersistentLruCache<TEnvelope> {
  get(key: string): TEnvelope | null
  listAll(): TEnvelope[]
  write(key: string, envelope: TEnvelope): void
  clear(): void
  isFresh(cachedAt: number): boolean
}

export const createPersistentLruCache = <TEnvelope>(
  options: PersistentLruCacheOptions<TEnvelope>,
): PersistentLruCache<TEnvelope> => {
  const memory = new LruCache<TEnvelope>(options.maxEntries)

  const loadPersistentCache = (): TEnvelope[] => {
    const storage = getLocalStorage()

    if (!storage) {
      return []
    }

    try {
      const rawValue = storage.getItem(options.storageKey)

      if (!rawValue) {
        return []
      }

      const parsedValue: unknown = JSON.parse(rawValue)

      if (!Array.isArray(parsedValue)) {
        return []
      }

      return parsedValue.filter((item) => options.isEnvelope(item))
    } catch {
      return []
    }
  }

  const persist = (): void => {
    const storage = getLocalStorage()

    if (!storage) {
      return
    }

    try {
      storage.setItem(options.storageKey, JSON.stringify(Array.from(memory.values())))
    } catch {
      // Ignore quota and serialization errors; caching is best-effort only.
    }
  }

  const hydrateEntries = (persistentEntries: TEnvelope[]): void => {
    for (const entry of persistentEntries) {
      memory.set(options.getKey(entry), entry)
    }
  }

  return {
    get(key: string): TEnvelope | null {
      const memoryValue = memory.get(key)

      if (memoryValue !== undefined) {
        return memoryValue
      }

      const persistentEntries = loadPersistentCache()

      if (persistentEntries.length === 0) {
        return null
      }

      hydrateEntries(persistentEntries)

      return memory.get(key) ?? null
    },

    listAll(): TEnvelope[] {
      const persistentEntries = loadPersistentCache()

      for (const entry of persistentEntries) {
        const key = options.getKey(entry)

        if (memory.get(key) === undefined) {
          memory.set(key, entry)
        }
      }

      return Array.from(memory.values())
    },

    write(key: string, envelope: TEnvelope): void {
      memory.set(key, envelope)
      persist()
    },

    clear(): void {
      memory.clear()

      const storage = getLocalStorage()

      if (!storage) {
        return
      }

      try {
        storage.removeItem(options.storageKey)
      } catch {
        // Ignore storage failures; clearing is best-effort only.
      }
    },

    isFresh(cachedAt: number): boolean {
      return Date.now() - cachedAt <= options.ttlMs
    },
  }
}
