import { excludeYankedPackages } from './packageCatalogFilters'
import type { RegistryPackage } from '../domain/package'
import {
  DEFAULT_DOWNLOAD_STATS_PERIOD,
  DOWNLOAD_STATS_PERIODS,
  EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID,
  emptyPackageDownloadStats,
  isDownloadStatsPeriod,
  packageDownloadStatsKey,
  type DownloadStatsPeriod,
  type PackageDownloadStats,
  type PackageDownloadStatsById,
} from '../domain/downloadStats'

export const HOME_POPULAR_PACKAGE_LIMIT = 6

export {
  DEFAULT_DOWNLOAD_STATS_PERIOD,
  DOWNLOAD_STATS_PERIODS,
  EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID,
  isDownloadStatsPeriod,
}

const downloadCountFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

export function formatPackageDownloadCount(value: number): string {
  return downloadCountFormatter.format(value)
}

export function getPackageDownloadStats(
  statsById: PackageDownloadStatsById,
  namespace: string,
  packageId: string,
): PackageDownloadStats {
  return statsById.get(packageDownloadStatsKey(namespace, packageId)) ?? emptyPackageDownloadStats(namespace, packageId)
}

export function getPackageDownloadMetric(
  stats: PackageDownloadStats,
  period: DownloadStatsPeriod,
): number {
  switch (period) {
    case '7d':
      return stats.downloads7d
    case '30d':
      return stats.downloads30d
    case '365d':
      return stats.downloads365d
    default:
      return stats.downloads
  }
}

function packageSortId(pkg: RegistryPackage): string {
  return `${pkg.namespace}/${pkg.package}`
}

function comparePackagesByDownloadPeriod(
  left: RegistryPackage,
  right: RegistryPackage,
  statsById: PackageDownloadStatsById,
  period: DownloadStatsPeriod,
): number {
  const leftStats = getPackageDownloadStats(statsById, left.namespace, left.package)
  const rightStats = getPackageDownloadStats(statsById, right.namespace, right.package)
  const periodDiff = getPackageDownloadMetric(rightStats, period) - getPackageDownloadMetric(leftStats, period)
  if (periodDiff !== 0) {
    return periodDiff
  }

  const allTimeDiff = rightStats.downloads - leftStats.downloads
  if (allTimeDiff !== 0) {
    return allTimeDiff
  }

  return packageSortId(left).localeCompare(packageSortId(right))
}

export function sortPackagesByDownloadPeriod(
  packages: readonly RegistryPackage[],
  statsById: PackageDownloadStatsById,
  period: DownloadStatsPeriod,
): RegistryPackage[] {
  return [...packages].sort((left, right) => comparePackagesByDownloadPeriod(left, right, statsById, period))
}

export function selectHomePopularPackages(
  packages: readonly RegistryPackage[],
  statsById: PackageDownloadStatsById,
  limit = HOME_POPULAR_PACKAGE_LIMIT,
): RegistryPackage[] {
  const listing = excludeYankedPackages(packages)
  const rankedByYear = sortPackagesByDownloadPeriod(listing, statsById, '365d')
  const withYearDownloads = rankedByYear.filter((pkg) => {
    return getPackageDownloadMetric(getPackageDownloadStats(statsById, pkg.namespace, pkg.package), '365d') > 0
  })

  if (withYearDownloads.length >= limit) {
    return withYearDownloads.slice(0, limit)
  }

  const selectedIds = new Set(withYearDownloads.map((pkg) => pkg.id))
  const fillers = listing.filter((pkg) => !selectedIds.has(pkg.id))
  return [...withYearDownloads, ...fillers].slice(0, limit)
}

export function parseDownloadStatsPeriod(searchParams: URLSearchParams): DownloadStatsPeriod {
  const value = (searchParams.get('period') ?? '').trim()
  return isDownloadStatsPeriod(value) ? value : DEFAULT_DOWNLOAD_STATS_PERIOD
}

export function applyDownloadStatsPeriodToSearchParams(
  searchParams: URLSearchParams,
  period: DownloadStatsPeriod,
): URLSearchParams {
  const next = new URLSearchParams(searchParams)
  if (period === DEFAULT_DOWNLOAD_STATS_PERIOD) {
    next.delete('period')
  } else {
    next.set('period', period)
  }

  return next
}
