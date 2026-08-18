import type { RegistryCatalog, RegistryPackage } from '../domain/package.ts'

export const PACKAGES_BASE_PATH = '/packages'

export type PackageSiteRoute =
  | { readonly kind: 'index' }
  | { readonly kind: 'namespace'; readonly namespace: string }
  | { readonly kind: 'detail'; readonly namespace: string; readonly packageId: string }

const PACKAGE_PATH_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normalizePackagesPathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}

export function getPackagesIndexPath(): string {
  return PACKAGES_BASE_PATH
}

export function getNamespacePackagesPath(namespace: string): string {
  return `${PACKAGES_BASE_PATH}/${namespace}`
}

export function getPackageDetailPath(namespace: string, packageId: string): string {
  return `${PACKAGES_BASE_PATH}/${namespace}/${packageId}`
}

export function isPackagePathSegment(value: string): boolean {
  return PACKAGE_PATH_SEGMENT_PATTERN.test(value)
}

export function parsePackageSitePath(pathname: string): PackageSiteRoute | undefined {
  const normalized = normalizePackagesPathname(pathname)

  if (normalized === PACKAGES_BASE_PATH) {
    return { kind: 'index' }
  }

  const prefix = `${PACKAGES_BASE_PATH}/`
  if (!normalized.startsWith(prefix)) {
    return undefined
  }

  const remainder = normalized.slice(prefix.length)
  const segments = remainder.split('/').filter(Boolean)

  if (segments.length === 1 && isPackagePathSegment(segments[0])) {
    return { kind: 'namespace', namespace: segments[0] }
  }

  if (
    segments.length === 2 &&
    isPackagePathSegment(segments[0]) &&
    isPackagePathSegment(segments[1])
  ) {
    return { kind: 'detail', namespace: segments[0], packageId: segments[1] }
  }

  return undefined
}

export function listPackageNamespaces(catalog: RegistryCatalog): string[] {
  return [...new Set(catalog.packages.map((pkg) => pkg.namespace))].sort((left, right) =>
    left.localeCompare(right),
  )
}

export function findRegistryPackage(
  catalog: RegistryCatalog,
  namespace: string,
  packageId: string,
): RegistryPackage | undefined {
  return catalog.packages.find((pkg) => pkg.namespace === namespace && pkg.package === packageId)
}

export function namespaceExistsInCatalog(catalog: RegistryCatalog, namespace: string): boolean {
  return catalog.packages.some((pkg) => pkg.namespace === namespace)
}

export function isPackageSitePathCatalogMember(
  pathname: string,
  catalog: RegistryCatalog | null,
): boolean {
  const parsed = parsePackageSitePath(pathname)
  if (parsed === undefined || parsed.kind === 'index') {
    return true
  }

  if (catalog === null) {
    return false
  }

  if (parsed.kind === 'namespace') {
    return namespaceExistsInCatalog(catalog, parsed.namespace)
  }

  return findRegistryPackage(catalog, parsed.namespace, parsed.packageId) !== undefined
}

export function isKnownPackageSiteRoute(
  pathname: string,
  catalog: RegistryCatalog | null,
  catalogResolved = catalog !== null,
): boolean {
  const parsed = parsePackageSitePath(pathname)
  if (parsed === undefined) {
    return false
  }

  if (parsed.kind === 'index') {
    return true
  }

  if (!catalogResolved) {
    return true
  }

  if (catalog === null) {
    return false
  }

  if (parsed.kind === 'namespace') {
    return namespaceExistsInCatalog(catalog, parsed.namespace)
  }

  return findRegistryPackage(catalog, parsed.namespace, parsed.packageId) !== undefined
}

export function isUnlistedPackageSitePath(
  pathname: string,
  catalog: RegistryCatalog | null,
  catalogResolved = catalog !== null,
): boolean {
  const normalized = normalizePackagesPathname(pathname)
  if (normalized === PACKAGES_BASE_PATH) {
    return false
  }

  if (!normalized.startsWith(`${PACKAGES_BASE_PATH}/`)) {
    return false
  }

  return !isKnownPackageSiteRoute(normalized, catalog, catalogResolved)
}

export function buildPackageSiteRoutesFromCatalog(catalog: RegistryCatalog): string[] {
  const namespaces = listPackageNamespaces(catalog)
  const details = catalog.packages.map((pkg) => getPackageDetailPath(pkg.namespace, pkg.package))
  return [...namespaces.map((namespace) => getNamespacePackagesPath(namespace)), ...details]
}
