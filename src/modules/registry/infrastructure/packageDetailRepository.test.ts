import { afterEach, describe, expect, it, vi } from 'vitest'
import { samplePackageDetail } from '../../../test/fixtures/samplePackageDetail'
import { resetRegistryPackageDetailCacheForTests } from './packageDetailCache'
import { loadPackageDetail, resetPackageDetailRepositoryForTests } from './packageDetailRepository'

describe('packageDetailRepository', () => {
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
})
