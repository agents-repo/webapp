import {
  findSiteRoutePath,
  normalizeSitePathname,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'
import { parseLocaleFromPathname } from '../i18n/localePath.ts'
import { getDocPageMeta } from '../docs/docsPageMeta.ts'
import {
  isUnlistedDocDetailPath,
  parseDocSlugFromPathname,
} from '../docs/docsNestedSiteRoutes.ts'
import {
  isUnlistedRepositoryDetailPath,
  parseRepositorySlugFromPathname,
} from '../nestedSiteRoutes.ts'
import { getRepositoryBySlug } from '../repositories/repositoryManifest.ts'
import {
  isUnlistedPackageSitePath,
  parsePackageSitePath,
} from '../../../registry/application/packageSiteRoutes.ts'
import { getPackageSitePageTitle } from '../../../registry/application/packageSiteSeo.ts'
import {
  getRuntimePackageCatalog,
  isRuntimePackageCatalogResolved,
} from '../../../registry/application/runtimePackageCatalog.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'
import {
  getLocalizedSiteRouteMeta,
  getLocalizedSiteRouteMetaByKey,
} from '../seo/siteRouteMetaLocales.ts'

export interface SitePageMeta {
  readonly title: string
  readonly routeLabel: string
}

function toSitePageMeta(meta: { readonly title: string; readonly routeLabel: string }): SitePageMeta {
  return {
    title: meta.title,
    routeLabel: meta.routeLabel,
  }
}

export const sitePageMeta: Record<SiteRoutePath, SitePageMeta> = {
  [siteRoutes.home]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.home)),
  [siteRoutes.packages]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.packages)),
  [siteRoutes.about]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.about)),
  [siteRoutes.community]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.community)),
  [siteRoutes.contact]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.contact)),
  [siteRoutes.helpUs]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.helpUs)),
  [siteRoutes.docs]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.docs)),
  [siteRoutes.repositories]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.repositories)),
  [siteRoutes.accessibility]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.accessibility)),
  [siteRoutes.privacy]: toSitePageMeta(getLocalizedSiteRouteMeta('en', siteRoutes.privacy)),
}

export function getSitePageMeta(
  pathname: string,
  catalog: RegistryCatalog | null = getRuntimePackageCatalog(),
  catalogResolved = isRuntimePackageCatalogResolved(),
): SitePageMeta {
  const { locale, pathnameWithoutLocale } = parseLocaleFromPathname(pathname)
  const normalizedPath = normalizeSitePathname(pathnameWithoutLocale)
  const matchedRoute = findSiteRoutePath(normalizedPath)

  if (matchedRoute) {
    return toSitePageMeta(getLocalizedSiteRouteMeta(locale, matchedRoute))
  }

  const repositorySlug = parseRepositorySlugFromPathname(normalizedPath)
  if (repositorySlug) {
    const entry = getRepositoryBySlug(repositorySlug)
    if (entry) {
      return {
        title: entry.name,
        routeLabel: entry.name,
      }
    }
  }

  const docSlug = parseDocSlugFromPathname(normalizedPath)
  if (docSlug) {
    const doc = getDocPageMeta(docSlug, locale)
    if (doc) {
      return {
        title: doc.title,
        routeLabel: doc.title,
      }
    }
  }

  const packageRoute = parsePackageSitePath(normalizedPath)
  if (packageRoute) {
    const title = getPackageSitePageTitle(packageRoute, catalog)
    return { title, routeLabel: title }
  }

  if (isUnlistedPackageSitePath(normalizedPath, catalog, catalogResolved)) {
    return toSitePageMeta(getLocalizedSiteRouteMetaByKey(locale, 'packageNotFound'))
  }

  if (isUnlistedDocDetailPath(normalizedPath)) {
    return toSitePageMeta(getLocalizedSiteRouteMeta(locale, siteRoutes.docs))
  }

  if (isUnlistedRepositoryDetailPath(normalizedPath)) {
    return toSitePageMeta(getLocalizedSiteRouteMeta(locale, siteRoutes.repositories))
  }

  return toSitePageMeta(getLocalizedSiteRouteMeta(locale, siteRoutes.home))
}
