export const DOWNLOAD_STATS_PERIODS = ['all', '7d', '30d', '365d'] as const

export type DownloadStatsPeriod = (typeof DOWNLOAD_STATS_PERIODS)[number]

export const DEFAULT_DOWNLOAD_STATS_PERIOD: DownloadStatsPeriod = 'all'

export const DOWNLOAD_STATS_PERIOD_LABELS: Readonly<Record<DownloadStatsPeriod, string>> = {
  all: 'All time',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '365d': 'Last 365 days',
}

export interface PackageDownloadStats {
  readonly namespace: string
  readonly package: string
  readonly downloads: number
  readonly downloads7d: number
  readonly downloads30d: number
  readonly downloads365d: number
}

export type PackageDownloadStatsById = ReadonlyMap<string, PackageDownloadStats>

export const EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID: PackageDownloadStatsById = new Map()

export function packageDownloadStatsKey(namespace: string, packageId: string): string {
  return `${namespace}/${packageId}`
}

export function isDownloadStatsPeriod(value: string): value is DownloadStatsPeriod {
  return (DOWNLOAD_STATS_PERIODS as readonly string[]).includes(value)
}

export function emptyPackageDownloadStats(namespace: string, packageId: string): PackageDownloadStats {
  return {
    namespace,
    package: packageId,
    downloads: 0,
    downloads7d: 0,
    downloads30d: 0,
    downloads365d: 0,
  }
}
