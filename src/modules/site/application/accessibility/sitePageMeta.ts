import {
  findSiteRoutePath,
  normalizeSitePathname,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'
import { getGuideCatalogEntry } from '../guide/guideCatalog.ts'
import {
  isUnlistedGuideDetailPath,
  parseGuideSlugFromPathname,
} from '../guide/guideNestedSiteRoutes.ts'
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
  [siteRoutes.contact]: {
    title: 'Contact',
    routeLabel: 'Contact',
  },
  [siteRoutes.helpUs]: {
    title: 'Help Us',
    routeLabel: 'Help Us',
  },
  [siteRoutes.guide]: {
    title: 'Guides',
    routeLabel: 'Guides',
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

  const guideSlug = parseGuideSlugFromPathname(normalizedPath)
  if (guideSlug) {
    const guide = getGuideCatalogEntry(guideSlug)
    if (guide) {
      return {
        title: guide.title,
        routeLabel: guide.title,
      }
    }
  }

  if (isUnlistedGuideDetailPath(normalizedPath)) {
    return sitePageMeta[siteRoutes.guide]
  }

  if (isUnlistedRepositoryDetailPath(normalizedPath)) {
    return sitePageMeta[siteRoutes.repositories]
  }

  return sitePageMeta[siteRoutes.home]
}
