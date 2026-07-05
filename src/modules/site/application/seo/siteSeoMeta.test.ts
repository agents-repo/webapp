import { describe, expect, it } from 'vitest'
import { siteRoutes } from '../../presentation/routes/siteRoutes'
import { getSiteRoutePaths, isKnownSiteRoute, siteSeoMeta } from './siteSeoMeta'

describe('siteSeoMeta', () => {
  it('defines descriptions for every site route', () => {
    for (const route of getSiteRoutePaths()) {
      expect(siteSeoMeta[route].description.length).toBeGreaterThan(0)
      expect(siteSeoMeta[route].description.length).toBeLessThanOrEqual(160)
      expect(siteSeoMeta[route].canonicalPath).toBe(route)
    }
  })

  it('includes all known routes', () => {
    expect(getSiteRoutePaths()).toEqual(
      expect.arrayContaining([
        siteRoutes.home,
        siteRoutes.about,
        siteRoutes.contact,
        siteRoutes.helpUs,
        siteRoutes.accessibility,
        siteRoutes.privacy,
        siteRoutes.privacyPt,
      ]),
    )
  })

  it('distinguishes known routes from unknown paths', () => {
    expect(isKnownSiteRoute(siteRoutes.about)).toBe(true)
    expect(isKnownSiteRoute('/about/')).toBe(true)
    expect(isKnownSiteRoute('/missing-page')).toBe(false)
  })
})
