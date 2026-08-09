import { describe, expect, it } from 'vitest'
import { siteRoutes } from '../../presentation/routes/siteRoutes'
import { getSitePageMeta } from './sitePageMeta'

describe('getSitePageMeta', () => {
  it('returns meta for known routes', () => {
    expect(getSitePageMeta(siteRoutes.home).title).toBe('Home')
    expect(getSitePageMeta(siteRoutes.about).title).toBe('About')
    expect(getSitePageMeta(siteRoutes.contact).title).toBe('Contact')
    expect(getSitePageMeta(siteRoutes.helpUs).title).toBe('Help Us')
    expect(getSitePageMeta(siteRoutes.repositories).title).toBe('Repositories')
    expect(getSitePageMeta(siteRoutes.accessibility).title).toBe('Accessibility')
  })

  it('returns manifest titles for repository detail routes', () => {
    expect(getSitePageMeta('/repositories/registry').title).toBe('Registry')
  })

  it('normalizes trailing slashes', () => {
    expect(getSitePageMeta('/about/')).toEqual(getSitePageMeta('/about'))
  })

  it('falls back to home meta for unknown paths', () => {
    expect(getSitePageMeta('/unknown')).toEqual(getSitePageMeta(siteRoutes.home))
  })

  it('falls back to repositories meta for unlisted repository slugs', () => {
    expect(getSitePageMeta('/repositories/not-listed')).toEqual(getSitePageMeta(siteRoutes.repositories))
    expect(getSitePageMeta('/repositories/foo/bar')).toEqual(getSitePageMeta(siteRoutes.repositories))
  })
})
