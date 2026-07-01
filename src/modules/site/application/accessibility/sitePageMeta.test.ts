import { describe, expect, it } from 'vitest'
import { siteRoutes } from '../../presentation/routes/siteRoutes'
import { getSitePageMeta } from './sitePageMeta'

describe('getSitePageMeta', () => {
  it('returns meta for known routes', () => {
    expect(getSitePageMeta(siteRoutes.home).title).toBe('Home')
    expect(getSitePageMeta(siteRoutes.about).title).toBe('About')
    expect(getSitePageMeta(siteRoutes.contact).title).toBe('Contact')
    expect(getSitePageMeta(siteRoutes.helpUs).title).toBe('Help Us')
    expect(getSitePageMeta(siteRoutes.accessibility).title).toBe('Accessibility')
  })

  it('normalizes trailing slashes', () => {
    expect(getSitePageMeta('/about/')).toEqual(getSitePageMeta('/about'))
  })

  it('falls back to home meta for unknown paths', () => {
    expect(getSitePageMeta('/unknown')).toEqual(getSitePageMeta(siteRoutes.home))
  })
})
