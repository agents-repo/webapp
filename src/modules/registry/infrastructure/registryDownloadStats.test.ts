import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildRegistryStatsUrl,
  loadRegistryDownloadStats,
  parseRegistryDownloadStatsPayload,
} from './registryDownloadStats'
import { packageDownloadStatsKey } from '../domain/downloadStats'

describe('registryDownloadStats', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the stats URL from the registry base URL', () => {
    expect(buildRegistryStatsUrl('https://registry.example.test/?ref=v2.x')).toBe(
      'https://registry.example.test/stats?ref=v2.x',
    )
  })

  it('parses window fields and skips invalid items', () => {
    const statsById = parseRegistryDownloadStatsPayload({
      packages: [
        {
          namespace: 'agents-repo',
          package: 'sample-agent',
          downloads: 12.9,
          downloads_7d: 3,
          downloads_30d: 8,
          downloads_365d: 11,
        },
        { namespace: '', package: 'missing-namespace', downloads: 9 },
        { namespace: 'other-org', package: 'legacy-tool' },
      ],
    })

    expect(statsById.get(packageDownloadStatsKey('agents-repo', 'sample-agent'))).toEqual({
      namespace: 'agents-repo',
      package: 'sample-agent',
      downloads: 12,
      downloads7d: 3,
      downloads30d: 8,
      downloads365d: 11,
    })
    expect(statsById.get(packageDownloadStatsKey('other-org', 'legacy-tool'))).toEqual({
      namespace: 'other-org',
      package: 'legacy-tool',
      downloads: 0,
      downloads7d: 0,
      downloads30d: 0,
      downloads365d: 0,
    })
    expect(statsById.size).toBe(2)
  })

  it('returns an empty map when the payload is not a stats list', () => {
    expect(parseRegistryDownloadStatsPayload({ error: 'downloads_unavailable' }).size).toBe(0)
    expect(parseRegistryDownloadStatsPayload(null).size).toBe(0)
  })

  it('returns zeros when the stats request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    const statsById = await loadRegistryDownloadStats({
      registryBaseUrl: 'https://registry.example.test',
    })

    expect(statsById.size).toBe(0)
  })

  it('returns zeros when the stats request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const statsById = await loadRegistryDownloadStats({
      registryBaseUrl: 'https://registry.example.test',
    })

    expect(statsById.size).toBe(0)
  })

  it('loads a valid stats payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            packages: [
              {
                namespace: 'agents-repo',
                package: 'sample-agent',
                downloads: 4,
                downloads_7d: 1,
                downloads_30d: 2,
                downloads_365d: 3,
              },
            ],
          }),
      }),
    )

    const statsById = await loadRegistryDownloadStats({
      registryBaseUrl: 'https://registry.example.test',
    })

    expect(statsById.get(packageDownloadStatsKey('agents-repo', 'sample-agent'))?.downloads365d).toBe(3)
  })
})
