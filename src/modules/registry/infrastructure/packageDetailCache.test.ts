import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail'
import { MemoryStorage } from '../../../test/memoryStorage'
import {
  buildPackageDetailCacheKey,
  readFreshPackageDetailCache,
  resetRegistryPackageDetailCacheForTests,
  writePackageDetailCache,
} from './packageDetailCache'

describe('packageDetailCache', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    resetRegistryPackageDetailCacheForTests()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    resetRegistryPackageDetailCacheForTests()
  })

  it('returns fresh detail within 24h and misses after TTL', () => {
    const cacheKey = buildPackageDetailCacheKey(
      'https://example.test/packages/agents-repo/sample-agent/detail.json',
      'agents-repo/sample-agent',
      '1.0.0',
    )
    writePackageDetailCache(cacheKey, samplePackageDetail)

    expect(readFreshPackageDetailCache(cacheKey)).toEqual(samplePackageDetail)

    vi.setSystemTime(new Date('2026-01-02T00:00:01.000Z'))
    expect(readFreshPackageDetailCache(cacheKey)).toBeNull()
  })
})
