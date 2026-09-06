import { parseLocaleFromPathname } from '../i18n/localePath.ts'
import {
  findSiteRoutePath,
  normalizeSitePathname,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'
import {
  getDocDetailPath,
} from '../docs/docsCatalog.ts'
import { getDocPageMeta } from '../docs/docsPageMeta.ts'
import { isUnlistedDocDetailPath, parseDocSlugFromPathname } from '../docs/docsNestedSiteRoutes.ts'
import {
  getRepositoryDetailPath,
  isUnlistedRepositoryDetailPath,
  parseRepositorySlugFromPathname,
} from '../nestedSiteRoutes.ts'
import { getRepositoryBySlug } from '../repositories/repositoryManifest.ts'
import {
  getNamespacePackagesPath,
  getPackageDetailPath,
  isUnlistedPackageSitePath,
  parsePackageSitePath,
  type PackageSiteRoute,
} from '../../../registry/application/packageSiteRoutes.ts'
import {
  getPackageSiteSeoDescription,
} from '../../../registry/application/packageSiteSeo.ts'
import {
  getRuntimePackageCatalog,
  isRuntimePackageCatalogResolved,
} from '../../../registry/application/runtimePackageCatalog.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'
import type { AppLocale } from '../i18n/supportedLocales.ts'
import { getLocalizedSiteRouteMeta } from './siteRouteMetaLocales.ts'

export type { SiteRoutePath } from '../../presentation/routes/siteRoutes.ts'
export { getSiteRoutePaths, isKnownSiteRoute } from '../../presentation/routes/siteRoutes.ts'

export interface SiteSeoMeta {
  readonly description: string
  readonly canonicalPath: string
}

export const siteSeoMeta: Record<SiteRoutePath, SiteSeoMeta> = {
  [siteRoutes.home]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.home).description ?? '',
    canonicalPath: siteRoutes.home,
  },
  [siteRoutes.packages]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.packages).description ?? '',
    canonicalPath: siteRoutes.packages,
  },
  [siteRoutes.about]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.about).description ?? '',
    canonicalPath: siteRoutes.about,
  },
  [siteRoutes.community]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.community).description ?? '',
    canonicalPath: siteRoutes.community,
  },
  [siteRoutes.contact]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.contact).description ?? '',
    canonicalPath: siteRoutes.contact,
  },
  [siteRoutes.helpUs]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.helpUs).description ?? '',
    canonicalPath: siteRoutes.helpUs,
  },
  [siteRoutes.docs]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.docs).description ?? '',
    canonicalPath: siteRoutes.docs,
  },
  [siteRoutes.repositories]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.repositories).description ?? '',
    canonicalPath: siteRoutes.repositories,
  },
  [siteRoutes.accessibility]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.accessibility).description ?? '',
    canonicalPath: siteRoutes.accessibility,
  },
  [siteRoutes.privacy]: {
    description: getLocalizedSiteRouteMeta('en', siteRoutes.privacy).description ?? '',
    canonicalPath: siteRoutes.privacy,
  },
}

function getLocalizedRouteSeoMeta(locale: AppLocale, route: SiteRoutePath): SiteSeoMeta {
  const localizedMeta = getLocalizedSiteRouteMeta(locale, route)

  return {
    description: localizedMeta.description ?? siteSeoMeta[route].description,
    canonicalPath: route,
  }
}

function getPackageCanonicalPath(route: PackageSiteRoute): string {
  if (route.kind === 'index') {
    return siteRoutes.packages
  }

  if (route.kind === 'namespace') {
    return getNamespacePackagesPath(route.namespace)
  }

  return getPackageDetailPath(route.namespace, route.packageId)
}

export function getSiteSeoMeta(
  pathname: string,
  catalog: RegistryCatalog | null = getRuntimePackageCatalog(),
  catalogResolved = isRuntimePackageCatalogResolved(),
): SiteSeoMeta {
  const { locale, pathnameWithoutLocale } = parseLocaleFromPathname(pathname)
  const normalizedPath = normalizeSitePathname(pathnameWithoutLocale)
  const matchedRoute = findSiteRoutePath(normalizedPath)

  if (matchedRoute) {
    return getLocalizedRouteSeoMeta(locale, matchedRoute)
  }

  const repositorySlug = parseRepositorySlugFromPathname(normalizedPath)
  if (repositorySlug) {
    const entry = getRepositoryBySlug(repositorySlug)
    if (entry) {
      return {
        description: entry.description,
        canonicalPath: getRepositoryDetailPath(repositorySlug),
      }
    }
  }

  const docSlug = parseDocSlugFromPathname(normalizedPath)
  if (docSlug) {
    const doc = getDocPageMeta(docSlug, locale)
    if (doc) {
      return {
        description: doc.description,
        canonicalPath: getDocDetailPath(docSlug),
      }
    }
  }

  const packageRoute = parsePackageSitePath(normalizedPath)
  if (packageRoute) {
    return {
      description: getPackageSiteSeoDescription(packageRoute, catalog),
      canonicalPath: getPackageCanonicalPath(packageRoute),
    }
  }

  if (isUnlistedPackageSitePath(normalizedPath, catalog, catalogResolved)) {
    return getLocalizedRouteSeoMeta(locale, siteRoutes.packages)
  }

  if (isUnlistedDocDetailPath(normalizedPath)) {
    return getLocalizedRouteSeoMeta(locale, siteRoutes.docs)
  }

  if (isUnlistedRepositoryDetailPath(normalizedPath)) {
    return getLocalizedRouteSeoMeta(locale, siteRoutes.repositories)
  }

  return getLocalizedRouteSeoMeta(locale, siteRoutes.home)
}
