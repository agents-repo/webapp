import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryStorage } from '../../../test/memoryStorage'
import { createPersistentLruCache, LruCache } from './persistentLruCache'

interface TestEnvelope {
  cacheKey: string
  cachedAt: number
  value: string
}

const STORAGE_KEY = 'registry.test.persistent-lru.v1'
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

const createTestCache = () =>
  createPersistentLruCache<TestEnvelope>({
    storageKey: STORAGE_KEY,
    maxEntries: 2,
    ttlMs: CACHE_TTL_MS,
    getKey: (envelope) => envelope.cacheKey,
    isEnvelope: isTestEnvelope,
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
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('persists writes and hydrates every envelope on a memory miss', () => {
    const writer = createTestCache()
    writer.write('a', envelope('a', 'alpha'))
    writer.write('b', envelope('b', 'beta'))

    const reader = createTestCache()
    expect(reader.get('a')).toEqual(envelope('a', 'alpha'))
    expect(reader.listAll()).toEqual(
      expect.arrayContaining([envelope('a', 'alpha'), envelope('b', 'beta')]),
    )
    expect(reader.listAll()).toHaveLength(2)
  })

  it('evicts the oldest persisted entry when over maxEntries', () => {
    const cache = createTestCache()
    cache.write('a', envelope('a', 'alpha'))
    cache.write('b', envelope('b', 'beta'))
    cache.write('c', envelope('c', 'gamma'))

    expect(cache.get('a')).toBeNull()
    expect(cache.get('c')?.value).toBe('gamma')

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as TestEnvelope[]
    expect(persisted.map((entry) => entry.cacheKey)).toEqual(['b', 'c'])
  })

  it('treats entries older than the TTL as stale', () => {
    const cache = createTestCache()
    cache.write('a', envelope('a', 'alpha'))

    expect(cache.isFresh(cache.get('a')?.cachedAt ?? 0)).toBe(true)

    vi.setSystemTime(new Date('2026-01-02T00:00:01.000Z'))
    expect(cache.isFresh(cache.get('a')?.cachedAt ?? 0)).toBe(false)
  })

  it('clears memory and localStorage', () => {
    const cache = createTestCache()
    cache.write('a', envelope('a', 'alpha'))
    cache.clear()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(cache.get('a')).toBeNull()
  })
})
