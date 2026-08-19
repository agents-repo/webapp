import { getDocRoutePaths, DOCS_BASE_PATH } from '../../application/docs/docsCatalog.ts'
import { parseDocSlugFromPathname } from '../../application/docs/docsNestedSiteRoutes.ts'
import {
  getRepositoryDetailRoutePaths,
  parseRepositorySlugFromPathname,
  REPOSITORIES_BASE_PATH,
} from '../../application/nestedSiteRoutes.ts'
import {
  isKnownPackageSiteRoute,
  PACKAGES_BASE_PATH,
} from '../../../registry/application/packageSiteRoutes.ts'
import {
  getRuntimePackageCatalog,
  isRuntimePackageCatalogResolved,
} from '../../../registry/application/runtimePackageCatalog.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'

export const siteRoutes = {
  home: '/',
  packages: PACKAGES_BASE_PATH,
  about: '/about',
  community: '/community',
  contact: '/contact',
  helpUs: '/help-us',
  docs: DOCS_BASE_PATH,
  repositories: REPOSITORIES_BASE_PATH,
  accessibility: '/accessibility',
  privacy: '/privacy',
  privacyPtBr: '/privacidade',
} as const

export type SiteRoutePath = (typeof siteRoutes)[keyof typeof siteRoutes]

export function normalizeSitePathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}

const fileUrlSegmentPattern = /\.[a-z0-9]+$/i

function splitPathAndSuffix(pathname: string): { readonly pathOnly: string; readonly suffix: string } {
  const queryIndex = pathname.indexOf('?')
  const hashIndex = pathname.indexOf('#')
  const splitCandidates = [queryIndex, hashIndex].filter((index) => index >= 0)
  if (splitCandidates.length === 0) {
    return { pathOnly: pathname, suffix: '' }
  }

  const splitAt = Math.min(...splitCandidates)
  return { pathOnly: pathname.slice(0, splitAt), suffix: pathname.slice(splitAt) }
}

export function publicSitePath(pathname: string): string {
  const { pathOnly, suffix } = splitPathAndSuffix(pathname)
  const normalized = normalizeSitePathname(pathOnly.length > 0 ? pathOnly : '/')

  if (normalized === '/') {
    return `/${suffix}`
  }

  const lastSegment = normalized.slice(normalized.lastIndexOf('/') + 1)
  if (fileUrlSegmentPattern.test(lastSegment)) {
    return `${normalized}${suffix}`
  }

  return `${normalized}/${suffix}`
}

export function findSiteRoutePath(normalizedPath: string): SiteRoutePath | undefined {
  const routePaths = Object.values(siteRoutes) as SiteRoutePath[]
  return routePaths.find((routePath) => routePath === normalizedPath)
}

export function isKnownSiteRoute(
  pathname: string,
  catalog: RegistryCatalog | null = getRuntimePackageCatalog(),
  catalogResolved = isRuntimePackageCatalogResolved(),
): boolean {
  const normalizedPath = normalizeSitePathname(pathname)
  if (findSiteRoutePath(normalizedPath) !== undefined) {
    return true
  }

  if (parseDocSlugFromPathname(normalizedPath) !== undefined) {
    return true
  }

  if (parseRepositorySlugFromPathname(normalizedPath) !== undefined) {
    return true
  }

  return isKnownPackageSiteRoute(normalizedPath, catalog, catalogResolved)
}

export function getSiteRoutePaths(): string[] {
  const staticPaths = Object.values(siteRoutes) as SiteRoutePath[]
  return [...staticPaths, ...getDocRoutePaths(), ...getRepositoryDetailRoutePaths()]
}
