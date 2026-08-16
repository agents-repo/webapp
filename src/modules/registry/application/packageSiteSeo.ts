import type { RegistryCatalog, RegistryPackage } from '../domain/package.ts'
import {
  findRegistryPackage,
  namespaceExistsInCatalog,
  parsePackageSitePath,
  type PackageSiteRoute,
} from './packageSiteRoutes.ts'
import { buildRegistryPackageBrowseUrl } from '../infrastructure/registrySourceUrl.ts'

export const PACKAGE_SEO_DESCRIPTION_MAX_LENGTH = 160

export function clampSeoDescription(
  value: string,
  maxLength = PACKAGE_SEO_DESCRIPTION_MAX_LENGTH,
): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

export function getPackagesIndexSeoDescription(): string {
  return 'Browse every published Agents Repo package. Search agents and flows for Copilot, Cursor, Claude Code, and Codex.'
}

export function getNamespacePackagesSeoDescription(namespace: string): string {
  return clampSeoDescription(
    `Browse published Agents Repo packages in the ${namespace} namespace for Copilot, Cursor, Claude Code, and Codex.`,
  )
}

export function getPackageDetailSeoDescription(pkg: RegistryPackage): string {
  return clampSeoDescription(pkg.description)
}

export function getPackageSitePageTitle(route: PackageSiteRoute, catalog: RegistryCatalog | null): string {
  if (route.kind === 'index') {
    return 'Packages'
  }

  if (route.kind === 'namespace') {
    return `${route.namespace} packages`
  }

  const pkg = catalog ? findRegistryPackage(catalog, route.namespace, route.packageId) : undefined
  return pkg?.name ?? route.packageId
}

export function getPackageSiteSeoDescription(
  route: PackageSiteRoute,
  catalog: RegistryCatalog | null,
): string {
  if (route.kind === 'index') {
    return getPackagesIndexSeoDescription()
  }

  if (route.kind === 'namespace') {
    return getNamespacePackagesSeoDescription(route.namespace)
  }

  const pkg = catalog ? findRegistryPackage(catalog, route.namespace, route.packageId) : undefined
  if (pkg) {
    return getPackageDetailSeoDescription(pkg)
  }

  return clampSeoDescription(
    `Latest published details for ${route.namespace}/${route.packageId} on the Agents Repo registry.`,
  )
}

export function getPackageCodeRepositoryUrl(
  githubRepositoryUrl: string,
  namespace: string,
  packageId: string,
): string | null {
  return buildRegistryPackageBrowseUrl(githubRepositoryUrl, namespace, packageId)
}

export function shouldIndexPackageSitePath(
  pathname: string,
  catalog: RegistryCatalog | null,
  catalogResolved: boolean,
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
