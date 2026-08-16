import {
  findSiteRoutePath,
  normalizeSitePathname,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'
import { getDocCatalogEntry } from '../docs/docsCatalog.ts'
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

export interface SitePageMeta {
  readonly title: string
  readonly routeLabel: string
}

export const sitePageMeta: Record<SiteRoutePath, SitePageMeta> = {
  [siteRoutes.home]: {
    title: 'Home',
    routeLabel: 'Home',
  },
  [siteRoutes.packages]: {
    title: 'Packages',
    routeLabel: 'Packages',
  },
  [siteRoutes.about]: {
    title: 'About',
    routeLabel: 'About',
  },
  [siteRoutes.community]: {
    title: 'Community',
    routeLabel: 'Community',
  },
  [siteRoutes.contact]: {
    title: 'Contact',
    routeLabel: 'Contact',
  },
  [siteRoutes.helpUs]: {
    title: 'Help Us',
    routeLabel: 'Help Us',
  },
  [siteRoutes.docs]: {
    title: 'Docs',
    routeLabel: 'Docs',
  },
  [siteRoutes.repositories]: {
    title: 'Repositories',
    routeLabel: 'Repositories',
  },
  [siteRoutes.accessibility]: {
    title: 'Accessibility',
    routeLabel: 'Accessibility statement',
  },
  [siteRoutes.privacy]: {
    title: 'Privacy',
    routeLabel: 'Privacy policy',
  },
  [siteRoutes.privacyPtBr]: {
    title: 'Privacidade',
    routeLabel: 'Política de privacidade',
  },
}

const packageNotFoundMeta: SitePageMeta = {
  title: 'Package not found',
  routeLabel: 'Package not found',
}

export function getSitePageMeta(
  pathname: string,
  catalog: RegistryCatalog | null = getRuntimePackageCatalog(),
  catalogResolved = isRuntimePackageCatalogResolved(),
): SitePageMeta {
  const normalizedPath = normalizeSitePathname(pathname)
  const matchedRoute = findSiteRoutePath(normalizedPath)

  if (matchedRoute) {
    return sitePageMeta[matchedRoute]
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
    const doc = getDocCatalogEntry(docSlug)
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
    return packageNotFoundMeta
  }

  if (isUnlistedDocDetailPath(normalizedPath)) {
    return sitePageMeta[siteRoutes.docs]
  }

  if (isUnlistedRepositoryDetailPath(normalizedPath)) {
    return sitePageMeta[siteRoutes.repositories]
  }

  return sitePageMeta[siteRoutes.home]
}
