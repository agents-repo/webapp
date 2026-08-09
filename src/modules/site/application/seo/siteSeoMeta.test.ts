import { describe, expect, it } from 'vitest'
import { siteRoutes } from '../../presentation/routes/siteRoutes'
import { getSiteRoutePaths, getSiteSeoMeta, isKnownSiteRoute, siteSeoMeta } from './siteSeoMeta'

describe('siteSeoMeta', () => {
  it('defines descriptions for every static site route', () => {
    for (const route of Object.keys(siteSeoMeta)) {
      expect(siteSeoMeta[route as keyof typeof siteSeoMeta].description.length).toBeGreaterThan(0)
      expect(siteSeoMeta[route as keyof typeof siteSeoMeta].description.length).toBeLessThanOrEqual(160)
      expect(siteSeoMeta[route as keyof typeof siteSeoMeta].canonicalPath).toBe(route)
    }
  })

  it('defines descriptions for every build route path', () => {
    for (const route of getSiteRoutePaths()) {
      const meta = getSiteSeoMeta(route)
      expect(meta.description.length).toBeGreaterThan(0)
      expect(meta.description.length).toBeLessThanOrEqual(160)
      expect(meta.canonicalPath).toBe(route)
    }
  })

  it('includes all known static routes', () => {
    expect(getSiteRoutePaths()).toEqual(
      expect.arrayContaining([
        siteRoutes.home,
        siteRoutes.about,
        siteRoutes.contact,
        siteRoutes.helpUs,
        siteRoutes.guide,
        siteRoutes.repositories,
        siteRoutes.accessibility,
        siteRoutes.privacy,
        siteRoutes.privacyPtBr,
        '/repositories/registry',
        '/guide/getting-started',
      ]),
    )
  })

  it('distinguishes known routes from unknown paths', () => {
    expect(isKnownSiteRoute(siteRoutes.about)).toBe(true)
    expect(isKnownSiteRoute('/about/')).toBe(true)
    expect(isKnownSiteRoute('/repositories/cli')).toBe(true)
    expect(isKnownSiteRoute('/guide/installing-packages')).toBe(true)
    expect(isKnownSiteRoute('/guide/not-listed')).toBe(false)
    expect(isKnownSiteRoute('/repositories/not-listed')).toBe(false)
    expect(isKnownSiteRoute('/missing-page')).toBe(false)
  })

  it('falls back to repositories SEO meta for unlisted repository slugs', () => {
    expect(getSiteSeoMeta('/repositories/not-listed')).toEqual(getSiteSeoMeta(siteRoutes.repositories))
  })

  it('falls back to guide SEO meta for unlisted guide slugs', () => {
    expect(getSiteSeoMeta('/guide/not-listed')).toEqual(getSiteSeoMeta(siteRoutes.guide))
  })
})
