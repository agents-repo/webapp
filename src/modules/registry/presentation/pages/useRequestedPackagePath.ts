import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  getPackagesIndexPath,
  isPackagePathSegment,
  parsePackageSitePath,
} from '../../application/packageSiteRoutes'

export interface RequestedPackagePath {
  readonly displayPath: string | null
  readonly searchQuery: string | null
}

function getPathSuffixAfterPackages(pathname: string): string | null {
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const prefix = `${getPackagesIndexPath()}/`

  if (!normalized.startsWith(prefix)) {
    return null
  }

  const remainder = normalized.slice(prefix.length)
  return remainder.length > 0 ? remainder : null
}

export function getRequestedPackagePath(
  pathname: string,
  namespaceParam?: string,
  packageIdParam?: string,
): RequestedPackagePath {
  if (
    namespaceParam &&
    packageIdParam &&
    isPackagePathSegment(namespaceParam) &&
    isPackagePathSegment(packageIdParam)
  ) {
    return {
      displayPath: `${namespaceParam}/${packageIdParam}`,
      searchQuery: `${namespaceParam}/${packageIdParam}`,
    }
  }

  if (namespaceParam && isPackagePathSegment(namespaceParam)) {
    return {
      displayPath: namespaceParam,
      searchQuery: namespaceParam,
    }
  }

  const parsed = parsePackageSitePath(pathname)
  if (parsed?.kind === 'detail') {
    return {
      displayPath: `${parsed.namespace}/${parsed.packageId}`,
      searchQuery: `${parsed.namespace}/${parsed.packageId}`,
    }
  }

  if (parsed?.kind === 'namespace') {
    return {
      displayPath: parsed.namespace,
      searchQuery: parsed.namespace,
    }
  }

  const suffix = getPathSuffixAfterPackages(pathname)
  if (!suffix) {
    return { displayPath: null, searchQuery: null }
  }

  const segments = suffix.split('/').filter(Boolean)
  if (segments.length >= 2 && isPackagePathSegment(segments[0]) && isPackagePathSegment(segments[1])) {
    return {
      displayPath: `${segments[0]}/${segments[1]}`,
      searchQuery: `${segments[0]}/${segments[1]}`,
    }
  }

  if (segments.length >= 1 && isPackagePathSegment(segments[0])) {
    return {
      displayPath: suffix,
      searchQuery: segments[0],
    }
  }

  return {
    displayPath: suffix,
    searchQuery: suffix,
  }
}

export function useRequestedPackagePath(): RequestedPackagePath {
  const { namespace, packageId } = useParams()
  const location = useLocation()

  return useMemo(
    () => getRequestedPackagePath(location.pathname, namespace, packageId),
    [location.pathname, namespace, packageId],
  )
}
