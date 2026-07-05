import {
  findSiteRoutePath,
  normalizeSitePathname,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'

export type { SiteRoutePath } from '../../presentation/routes/siteRoutes.ts'
export { getSiteRoutePaths, isKnownSiteRoute } from '../../presentation/routes/siteRoutes.ts'

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
  [siteRoutes.privacy]: {
    description:
      'Privacy policy for Agents Repo: data collection, cookies, analytics consent, and your rights in the EU, US, and Brazil.',
    canonicalPath: siteRoutes.privacy,
  },
  [siteRoutes.privacyPt]: {
    description:
      'Política de privacidade do Agents Repo: coleta de dados, cookies, consentimento de analytics e seus direitos.',
    canonicalPath: siteRoutes.privacyPt,
  },
}

export function getSiteSeoMeta(pathname: string): SiteSeoMeta {
  const normalizedPath = normalizeSitePathname(pathname)
  const matchedRoute = findSiteRoutePath(normalizedPath)

  if (matchedRoute) {
    return siteSeoMeta[matchedRoute]
  }

  return siteSeoMeta[siteRoutes.home]
}
