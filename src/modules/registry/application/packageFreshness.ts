import type { PackageDetailDocument } from '../domain/packageDetail'

export const PACKAGE_FRESHNESS_RECENT_DAYS = 90

export type PackageFreshnessLabel = 'recentlyUpdated'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function isValidDateString(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

function getLatestVersionCreatedAt(detail: PackageDetailDocument): string | null {
  const { latest, entries } = detail.versions
  const latestEntry = entries.find((entry) => entry.version === latest)
  if (latestEntry && isValidDateString(latestEntry.createdAt)) {
    return latestEntry.createdAt
  }

  let newest: string | null = null
  for (const entry of entries) {
    if (!isValidDateString(entry.createdAt)) {
      continue
    }

    if (newest === null || Date.parse(entry.createdAt) > Date.parse(newest)) {
      newest = entry.createdAt
    }
  }

  return newest
}

export function getPackageLastUpdatedAt(detail: PackageDetailDocument): string | null {
  const candidates: string[] = []

  if (detail.metadata.updatedAt && isValidDateString(detail.metadata.updatedAt)) {
    candidates.push(detail.metadata.updatedAt)
  }

  const latestVersionCreatedAt = getLatestVersionCreatedAt(detail)
  if (latestVersionCreatedAt) {
    candidates.push(latestVersionCreatedAt)
  }

  if (candidates.length === 0) {
    return null
  }

  return candidates.reduce(
    (newest, candidate) => (Date.parse(candidate) > Date.parse(newest) ? candidate : newest),
    candidates[0],
  )
}

export function getPackageFreshnessLabel(
  lastUpdatedAt: string,
  now: Date = new Date(),
): PackageFreshnessLabel | null {
  if (!isValidDateString(lastUpdatedAt)) {
    return null
  }

  const ageMs = now.getTime() - Date.parse(lastUpdatedAt)
  if (ageMs < 0) {
    return 'recentlyUpdated'
  }

  const ageDays = ageMs / MS_PER_DAY
  return ageDays <= PACKAGE_FRESHNESS_RECENT_DAYS ? 'recentlyUpdated' : null
}
