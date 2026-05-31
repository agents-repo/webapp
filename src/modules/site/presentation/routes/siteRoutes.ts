export const siteRoutes = {
  home: '/',
  about: '/about',
  contact: '/contact',
  helpUs: '/help-us',
} as const

export type SiteRoutePath = (typeof siteRoutes)[keyof typeof siteRoutes]
