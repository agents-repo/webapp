import { siteRoutes, type SiteRoutePath } from '../../presentation/routes/siteRoutes.ts'

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
  [siteRoutes.accessibility]: {
    title: 'Accessibility',
    routeLabel: 'Accessibility statement',
  },
}

export function getSitePageMeta(pathname: string): SitePageMeta {
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const routePaths = Object.values(siteRoutes) as SiteRoutePath[]
  const matchedRoute = routePaths.find((routePath) => routePath === normalizedPath)

  if (matchedRoute) {
    return sitePageMeta[matchedRoute]
  }

  return sitePageMeta[siteRoutes.home]
}
