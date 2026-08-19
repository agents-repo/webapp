import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryCacheBackend, type PersistentCacheBackend } from './indexedDbCacheBackend'
import { createPersistentLruCache, LruCache } from './persistentLruCache'

interface TestEnvelope {
  cacheKey: string
  cachedAt: number
  value: string
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const isTestEnvelope = (value: unknown): value is TestEnvelope => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.cacheKey === 'string' &&
    typeof record.cachedAt === 'number' &&
    typeof record.value === 'string'
  )
}

const createTestCache = (backend: MemoryCacheBackend<TestEnvelope>) =>
  createPersistentLruCache<TestEnvelope>({
    storeName: 'catalog',
    maxEntries: 2,
    ttlMs: CACHE_TTL_MS,
    getKey: (envelope) => envelope.cacheKey,
    isEnvelope: isTestEnvelope,
    backend,
  })

const envelope = (cacheKey: string, value: string, cachedAt = Date.now()): TestEnvelope => ({
  cacheKey,
  cachedAt,
  value,
})

describe('LruCache', () => {
  it('evicts the oldest unread entry when over capacity', () => {
    const cache = new LruCache<string>(2)
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('c', '3')

    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('2')
    expect(cache.get('c')).toBe('3')
  })

  it('treats a read as a recency touch', () => {
    const cache = new LruCache<string>(2)
    cache.set('a', '1')
    cache.set('b', '2')
    expect(cache.get('a')).toBe('1')
    cache.set('c', '3')

    expect(cache.get('a')).toBe('1')
    expect(cache.get('b')).toBeUndefined()
  })
})

describe('createPersistentLruCache', () => {
  let backend: MemoryCacheBackend<TestEnvelope>

  beforeEach(() => {
    backend = new MemoryCacheBackend<TestEnvelope>()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('persists writes and hydrates every envelope on a memory miss', async () => {
    const writer = createTestCache(backend)
    await writer.write('a', envelope('a', 'alpha'))
    await writer.write('b', envelope('b', 'beta'))

    const reader = createTestCache(backend)
    await expect(reader.get('a')).resolves.toEqual(envelope('a', 'alpha'))
    await expect(reader.listAll()).resolves.toEqual(
      expect.arrayContaining([envelope('a', 'alpha'), envelope('b', 'beta')]),
    )
    await expect(reader.listAll()).resolves.toHaveLength(2)
  })

  it('awaits backend hydrate before treating a read as a miss', async () => {
    vi.useRealTimers()
    await backend.replaceAll([{ key: 'a', envelope: envelope('a', 'alpha', Date.now()) }])

    let resolveList: (() => void) | undefined
    const delayedBackend: PersistentCacheBackend<TestEnvelope> = {
      listAll: async () => {
        await new Promise<void>((resolve) => {
          resolveList = resolve
        })
        return backend.listAll()
      },
      replaceAll: (entries) => backend.replaceAll(entries),
      clear: () => backend.clear(),
    }

    const cache = createPersistentLruCache<TestEnvelope>({
      storeName: 'catalog',
      maxEntries: 2,
      ttlMs: CACHE_TTL_MS,
      getKey: (item) => item.cacheKey,
      isEnvelope: isTestEnvelope,
      backend: delayedBackend,
    })

    const pendingGet = cache.get('a')
    await Promise.resolve()
    resolveList?.()
    await expect(pendingGet).resolves.toMatchObject({ value: 'alpha' })
  })

  it('evicts the oldest persisted entry when over maxEntries', async () => {
    const cache = createTestCache(backend)
    await cache.write('a', envelope('a', 'alpha'))
    await cache.write('b', envelope('b', 'beta'))
    await cache.write('c', envelope('c', 'gamma'))

    await expect(cache.get('a')).resolves.toBeNull()
    await expect(cache.get('c')).resolves.toMatchObject({ value: 'gamma' })

    const persisted = await backend.listAll()
    expect(persisted.map((entry) => entry.cacheKey)).toEqual(['b', 'c'])
  })

  it('treats entries older than the TTL as stale', async () => {
    const cache = createTestCache(backend)
    await cache.write('a', envelope('a', 'alpha'))
    const cached = await cache.get('a')

    expect(cache.isFresh(cached?.cachedAt ?? 0)).toBe(true)

    vi.setSystemTime(new Date('2026-01-02T00:00:01.000Z'))
    expect(cache.isFresh((await cache.get('a'))?.cachedAt ?? 0)).toBe(false)
  })

  it('clears memory and the persistent backend', async () => {
    const cache = createTestCache(backend)
    await cache.write('a', envelope('a', 'alpha'))
    await cache.clear()

    await expect(backend.listAll()).resolves.toEqual([])
    await expect(cache.get('a')).resolves.toBeNull()
  })

  it('treats entries as always fresh when ttlMs is null', async () => {
    const cache = createPersistentLruCache<TestEnvelope>({
      storeName: 'catalog',
      maxEntries: 2,
      ttlMs: null,
      getKey: (envelope) => envelope.cacheKey,
      isEnvelope: isTestEnvelope,
      backend,
    })
    await cache.write('a', envelope('a', 'alpha'))
    vi.setSystemTime(new Date('2027-01-01T00:00:00.000Z'))
    expect(cache.isFresh((await cache.get('a'))?.cachedAt ?? 0)).toBe(true)
  })
})
