import { siteRoutes, type SiteRoutePath } from '../../presentation/routes/siteRoutes.ts'

export interface SiteSeoMeta {
  readonly description: string
  readonly canonicalPath: SiteRoutePath
}

export const siteSeoMeta: Record<SiteRoutePath, SiteSeoMeta> = {
  [siteRoutes.home]: {
    description: 'Browse, search, and download agents and flows from the registry.',
    canonicalPath: siteRoutes.home,
  },
  [siteRoutes.about]: {
    description:
      'Learn about Agents Repo, the web interface for discovering curated agents and flows from the registry.',
    canonicalPath: siteRoutes.about,
  },
  [siteRoutes.contact]: {
    description: 'Contact the Agents Repo team for questions, feedback, or support.',
    canonicalPath: siteRoutes.contact,
  },
  [siteRoutes.helpUs]: {
    description:
      'Help improve Agents Repo and the registry by contributing packages, reporting issues, or sharing feedback.',
    canonicalPath: siteRoutes.helpUs,
  },
  [siteRoutes.accessibility]: {
    description:
      'Accessibility statement and conformance report for Agents Repo, targeting WCAG 2.2 Level AA.',
    canonicalPath: siteRoutes.accessibility,
  },
}

export function getSiteSeoMeta(pathname: string): SiteSeoMeta {
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const routePaths = Object.values(siteRoutes) as SiteRoutePath[]
  const matchedRoute = routePaths.find((routePath) => routePath === normalizedPath)

  if (matchedRoute) {
    return siteSeoMeta[matchedRoute]
  }

  return siteSeoMeta[siteRoutes.home]
}

export function getSiteRoutePaths(): SiteRoutePath[] {
  return Object.values(siteRoutes)
}
