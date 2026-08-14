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

export interface SitePageMeta {
  readonly title: string
  readonly routeLabel: string
}

export const sitePageMeta: Record<SiteRoutePath, SitePageMeta> = {
  [siteRoutes.home]: {
    title: 'Home',
    routeLabel: 'Home',
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

export function getSitePageMeta(pathname: string): SitePageMeta {
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

  if (isUnlistedDocDetailPath(normalizedPath)) {
    return sitePageMeta[siteRoutes.docs]
  }

  if (isUnlistedRepositoryDetailPath(normalizedPath)) {
    return sitePageMeta[siteRoutes.repositories]
  }

  return sitePageMeta[siteRoutes.home]
}
