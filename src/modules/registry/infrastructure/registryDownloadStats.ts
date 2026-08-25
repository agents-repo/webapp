import { buildRegistryIndexUrl } from './registrySourceUrl'
import {
  EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID,
  packageDownloadStatsKey,
  type PackageDownloadStats,
  type PackageDownloadStatsById,
} from '../domain/downloadStats'

const STATS_PATH = 'stats'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const toCount = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0
  }

  return Math.floor(value)
}

const parsePackageDownloadStatsItem = (value: unknown): PackageDownloadStats | null => {
  if (!isRecord(value)) {
    return null
  }

  const namespace = typeof value.namespace === 'string' ? value.namespace.trim() : ''
  const packageId = typeof value.package === 'string' ? value.package.trim() : ''
  if (!namespace || !packageId) {
    return null
  }

  return {
    namespace,
    package: packageId,
    downloads: toCount(value.downloads),
    downloads7d: toCount(value.downloads_7d),
    downloads30d: toCount(value.downloads_30d),
    downloads365d: toCount(value.downloads_365d),
  }
}

export const parseRegistryDownloadStatsPayload = (payload: unknown): PackageDownloadStatsById => {
  if (!isRecord(payload) || !Array.isArray(payload.packages)) {
    return EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID
  }

  const statsById = new Map<string, PackageDownloadStats>()
  for (const item of payload.packages) {
    const parsed = parsePackageDownloadStatsItem(item)
    if (!parsed) {
      continue
    }

    statsById.set(packageDownloadStatsKey(parsed.namespace, parsed.package), parsed)
  }

  return statsById
}

export const buildRegistryStatsUrl = (registryBaseUrl: string): string => {
  return buildRegistryIndexUrl(registryBaseUrl, STATS_PATH)
}

export const loadRegistryDownloadStats = async (options: {
  readonly registryBaseUrl: string
  readonly signal?: AbortSignal
}): Promise<PackageDownloadStatsById> => {
  const registryBaseUrl = options.registryBaseUrl.trim()
  if (!registryBaseUrl) {
    return EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID
  }

  try {
    const response = await fetch(buildRegistryStatsUrl(registryBaseUrl), {
      headers: { Accept: 'application/json' },
      signal: options.signal,
    })

    if (!response.ok) {
      return EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID
    }

    return parseRegistryDownloadStatsPayload(await response.json())
  } catch {
    return EMPTY_PACKAGE_DOWNLOAD_STATS_BY_ID
  }
}
