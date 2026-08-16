import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail'
import {
  buildPackageDetailCacheKey,
  readFreshPackageDetailCache,
  resetRegistryPackageDetailCacheForTests,
} from './packageDetailCache'
import {
  clearRegistryPackageDetailCache,
  loadPackageDetail,
  resetPackageDetailRepositoryForTests,
} from './packageDetailRepository'
import { buildRegistryPackageDetailUrl } from './registrySourceUrl'

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

describe('packageDetailRepository', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    })
    resetPackageDetailRepositoryForTests()
    resetRegistryPackageDetailCacheForTests()
  })

  afterEach(() => {
    resetPackageDetailRepositoryForTests()
    resetRegistryPackageDetailCacheForTests()
    vi.unstubAllGlobals()
  })

  it('fetches detail.json without no-store and reuses the 24h cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(samplePackageDetail),
    })
    vi.stubGlobal('fetch', fetchMock)

    const options = {
      registryBaseUrl: 'https://example.test/registry',
      namespace: 'agents-repo',
      packageId: 'sample-agent',
      latest: '1.0.0',
    }

    await expect(loadPackageDetail(options)).resolves.toEqual(samplePackageDetail)
    await expect(loadPackageDetail(options)).resolves.toEqual(samplePackageDetail)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1]).not.toMatchObject({ cache: 'no-store' })
  })

  it('does not let an in-flight fetch refill storage after cache clear', async () => {
    let finishFetch: ((value: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finishFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const options = {
      registryBaseUrl: 'https://example.test/registry',
      namespace: 'agents-repo',
      packageId: 'sample-agent',
      latest: '9.9.9',
    }
    const pending = loadPackageDetail(options)
    await Promise.resolve()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const cacheKey = buildPackageDetailCacheKey(
      buildRegistryPackageDetailUrl(options.registryBaseUrl, options.namespace, options.packageId),
      `${options.namespace}/${options.packageId}`,
      options.latest,
    )

    clearRegistryPackageDetailCache()
    finishFetch?.({
      ok: true,
      json: () => Promise.resolve(samplePackageDetail),
    })
    await expect(pending).resolves.toEqual(samplePackageDetail)
    expect(readFreshPackageDetailCache(cacheKey)).toBeNull()

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(samplePackageDetail),
    })
    await expect(loadPackageDetail(options)).resolves.toEqual(samplePackageDetail)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
