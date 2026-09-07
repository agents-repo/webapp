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
import { stripLocalePrefix } from '../../application/i18n/localePath.ts'
import { normalizeSitePathname } from '../../application/routes/sitePath.ts'
import {
  getRuntimePackageCatalog,
  isRuntimePackageCatalogResolved,
} from '../../../registry/application/runtimePackageCatalog.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'

export { normalizeSitePathname, publicSitePath } from '../../application/routes/sitePath.ts'

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
} as const

export type SiteRoutePath = (typeof siteRoutes)[keyof typeof siteRoutes]

export function findSiteRoutePath(normalizedPath: string): SiteRoutePath | undefined {
  const routePaths = Object.values(siteRoutes) as SiteRoutePath[]
  return routePaths.find((routePath) => routePath === normalizedPath)
}

export function getSiteRoutePaths(): string[] {
  const staticPaths = Object.values(siteRoutes) as SiteRoutePath[]
  return [...staticPaths, ...getDocRoutePaths(), ...getRepositoryDetailRoutePaths()]
}

export function isKnownSiteRoute(
  pathname: string,
  catalog: RegistryCatalog | null = getRuntimePackageCatalog(),
  catalogResolved = isRuntimePackageCatalogResolved(),
): boolean {
  const normalizedPath = normalizeSitePathname(stripLocalePrefix(pathname))
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
