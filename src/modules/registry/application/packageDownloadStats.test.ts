import { describe, expect, it } from 'vitest'
import { filterableRegistryCatalog } from '../../../test/fixtures/filterableRegistryCatalog'
import { sampleRegistryCatalog } from '../../../test/fixtures/sampleRegistryCatalog'
import {
  applyDownloadStatsPeriodToSearchParams,
  formatPackageDownloadCount,
  parseDownloadStatsPeriod,
  selectHomePopularPackages,
  sortPackagesByDownloadPeriod,
} from './packageDownloadStats'
import { packageDownloadStatsKey, type PackageDownloadStats } from '../domain/downloadStats'

const stats = (options: {
  readonly namespace: string
  readonly package: string
  readonly downloads: number
  readonly downloads7d: number
  readonly downloads30d: number
  readonly downloads365d: number
}): PackageDownloadStats => options

const statsByIdFrom = (items: readonly PackageDownloadStats[]) => {
  return new Map(items.map((item) => [packageDownloadStatsKey(item.namespace, item.package), item]))
}

describe('packageDownloadStats', () => {
  it('parses known periods and defaults unknown values to all time', () => {
    expect(parseDownloadStatsPeriod(new URLSearchParams('period=7d'))).toBe('7d')
    expect(parseDownloadStatsPeriod(new URLSearchParams('period=24h'))).toBe('all')
    expect(parseDownloadStatsPeriod(new URLSearchParams())).toBe('all')
  })

  it('omits the default period from the URL and sets rolling windows', () => {
    const withWindow = applyDownloadStatsPeriodToSearchParams(new URLSearchParams('q=review'), '30d')
    expect(withWindow.get('period')).toBe('30d')
    expect(withWindow.get('q')).toBe('review')

    const allTime = applyDownloadStatsPeriodToSearchParams(withWindow, 'all')
    expect(allTime.get('period')).toBeNull()
    expect(allTime.get('q')).toBe('review')
  })

  it('drops page when the download window changes and keeps filters', () => {
    const next = applyDownloadStatsPeriodToSearchParams(
      new URLSearchParams('q=review&category=automation&page=3'),
      '7d',
    )
    expect(next.get('page')).toBeNull()
    expect(next.get('period')).toBe('7d')
    expect(next.get('q')).toBe('review')
    expect(next.get('category')).toBe('automation')
  })

  it('sorts by the selected window, then all-time, then package id', () => {
    const packages = filterableRegistryCatalog.packages.filter((pkg) => pkg.status !== 'yanked')
    const statsById = statsByIdFrom([
      stats({
        namespace: 'agents-repo',
        package: 'review-agent',
        downloads: 10,
        downloads7d: 1,
        downloads30d: 8,
        downloads365d: 9,
      }),
      stats({
        namespace: 'agents-repo',
        package: 'plan-flow',
        downloads: 5,
        downloads7d: 20,
        downloads30d: 4,
        downloads365d: 5,
      }),
      stats({
        namespace: 'other-org',
        package: 'legacy-helper',
        downloads: 100,
        downloads7d: 0,
        downloads30d: 2,
        downloads365d: 80,
      }),
    ])

    expect(sortPackagesByDownloadPeriod(packages, statsById, 'all').map((pkg) => pkg.package)).toEqual([
      'legacy-helper',
      'review-agent',
      'plan-flow',
    ])
    expect(sortPackagesByDownloadPeriod(packages, statsById, '7d').map((pkg) => pkg.package)).toEqual([
      'plan-flow',
      'review-agent',
      'legacy-helper',
    ])
  })

  it('selects the home slice by last-year downloads and fills from catalog order when cold', () => {
    const extraPackages = Array.from({ length: 8 }, (_, index) => ({
      ...sampleRegistryCatalog.packages[0],
      id: `agents-repo/filler-${index}`,
      package: `filler-${index}`,
      name: `filler-${index}`,
    }))
    const packages = [
      extraPackages[0],
      extraPackages[1],
      {
        ...sampleRegistryCatalog.packages[0],
        id: 'agents-repo/hot-package',
        package: 'hot-package',
        name: 'hot-package',
      },
      ...extraPackages.slice(2),
    ]
    const statsById = statsByIdFrom([
      stats({
        namespace: 'agents-repo',
        package: 'hot-package',
        downloads: 3,
        downloads7d: 1,
        downloads30d: 2,
        downloads365d: 3,
      }),
    ])

    expect(selectHomePopularPackages(packages, statsById).map((pkg) => pkg.package)).toEqual([
      'hot-package',
      'filler-0',
      'filler-1',
      'filler-2',
      'filler-3',
      'filler-4',
    ])
  })

  it('formats download counts with the runtime locale', () => {
    expect(formatPackageDownloadCount(1234)).toBe(new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(1234))
  })
})
