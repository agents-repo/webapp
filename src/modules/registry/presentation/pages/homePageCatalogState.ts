import type { InstallTargetEntry, RegistryCatalog, RegistryPackage } from '../../domain/package'
import { getInstallTargetLabel } from '../../application/installTargets'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { buildRegistryArtifactUrl } from '../../infrastructure/registrySourceUrl'

export type CatalogCacheState = 'none' | 'fresh' | 'stale-fallback'

export interface CatalogAlertState {
  variant: 'warning' | 'danger'
  message: string
}

export interface PackageDownloadTarget {
  id: InstallTargetEntry['id']
  status: InstallTargetEntry['status']
  label: string
  href: string
}

export const getPackageDownloadTargets = (
  pkg: RegistryPackage,
  registryBaseUrl: string,
): PackageDownloadTarget[] => {
  if (!registryBaseUrl.trim()) {
    return []
  }

  return (pkg.installTargets ?? [])
    .map((target) => ({
      ...target,
      label: getInstallTargetLabel(target.id),
      href: buildRegistryArtifactUrl(registryBaseUrl, pkg.id, pkg.latest, target.id),
    }))
    .filter((target) => isSafeExternalHttpUrl(target.href))
}

export const getCatalogStatusTag = ({
  catalog,
  cacheState,
  isLoading,
  errorMessage,
}: {
  catalog: RegistryCatalog | null
  cacheState: CatalogCacheState
  isLoading: boolean
  errorMessage: string | null
}): string => {
  if (isLoading) {
    return 'loading'
  }

  if (!catalog) {
    return 'unavailable'
  }

  switch (cacheState) {
    case 'fresh':
      return errorMessage
        ? 'cached catalog after source resolution failure'
        : 'fresh cache'
    case 'stale-fallback':
      return 'stale cache after refresh failure'
    default:
      return errorMessage ? 'remote refresh failed' : 'remote source'
  }
}

export const getCatalogAlertState = ({
  hasCatalog,
  cacheState,
  errorMessage,
}: {
  hasCatalog: boolean
  cacheState: CatalogCacheState
  errorMessage: string | null
}): CatalogAlertState | null => {
  if (!errorMessage) {
    return null
  }

  if (!hasCatalog) {
    return {
      variant: 'danger',
      message: 'Unable to load the registry index. No catalog data is available.',
    }
  }

  if (cacheState === 'stale-fallback') {
    return {
      variant: 'warning',
      message: 'Remote registry refresh failed. Displaying stale cached catalog while keeping the app available.',
    }
  }

  if (cacheState === 'fresh') {
    return {
      variant: 'warning',
      message:
        'Registry source resolution failed. Displaying cached catalog while keeping the app available.',
    }
  }

  return null
}

export const getCatalogResultsSummary = ({
  catalog,
  filteredCount,
  isLoading,
}: {
  catalog: RegistryCatalog | null
  filteredCount: number
  isLoading: boolean
}): string => {
  if (catalog) {
    return `Showing ${filteredCount} of ${catalog.packages.length} packages`
  }

  if (isLoading) {
    return 'Loading registry catalog'
  }

  return 'No catalog data available'
}
