export const siteRoutes = {
  home: '/',
  about: '/about',
  contact: '/contact',
  helpUs: '/help-us',
  accessibility: '/accessibility',
  privacy: '/privacy',
  privacyPt: '/privacidade',
} as const

export type SiteRoutePath = (typeof siteRoutes)[keyof typeof siteRoutes]

export function normalizeSitePathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}

export function findSiteRoutePath(normalizedPath: string): SiteRoutePath | undefined {
  const routePaths = Object.values(siteRoutes) as SiteRoutePath[]
  return routePaths.find((routePath) => routePath === normalizedPath)
}

export function isKnownSiteRoute(pathname: string): boolean {
  return findSiteRoutePath(normalizeSitePathname(pathname)) !== undefined
}

export function getSiteRoutePaths(): SiteRoutePath[] {
  return Object.values(siteRoutes)
}
