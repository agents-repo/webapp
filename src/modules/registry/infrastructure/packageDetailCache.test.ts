import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail'
import {
  buildPackageDetailCacheKey,
  readFreshPackageDetailCache,
  resetRegistryPackageDetailCacheForTests,
  writePackageDetailCache,
} from './packageDetailCache'

describe('packageDetailCache', () => {
  beforeEach(async () => {
    await resetRegistryPackageDetailCacheForTests()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(async () => {
    vi.useRealTimers()
    await resetRegistryPackageDetailCacheForTests()
  })

  it('returns fresh detail within 24h and misses after TTL', async () => {
    const cacheKey = buildPackageDetailCacheKey(
      'https://example.test/packages/agents-repo/sample-agent/detail.json',
      'agents-repo/sample-agent',
      '1.0.0',
    )
    await writePackageDetailCache(cacheKey, samplePackageDetail)

    await expect(readFreshPackageDetailCache(cacheKey)).resolves.toEqual(samplePackageDetail)

    vi.setSystemTime(new Date('2026-01-02T00:00:01.000Z'))
    await expect(readFreshPackageDetailCache(cacheKey)).resolves.toBeNull()
  })
})
