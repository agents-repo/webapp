import { describe, expect, it } from 'vitest'
import { siteRoutes } from '../../presentation/routes/siteRoutes'
import {
  buildRouteHead,
  getRouteHeadData,
  injectRouteHeadIntoHtml,
  injectSpaFallbackHeadIntoHtml,
  renderRouteHeadHtml,
} from './buildRouteHead'

describe('getRouteHeadData', () => {
  it('uses absolute canonical and OG image URLs', () => {
    const head = getRouteHeadData(siteRoutes.about, 'https://agents-repo.github.io')

    expect(head.canonicalUrl).toBe('https://agents-repo.github.io/about')
    expect(head.ogUrl).toBe(head.canonicalUrl)
    expect(head.ogImage).toBe('https://agents-repo.github.io/og-image.png')
    expect(head.ogImage).toMatch(/^https:\/\//)
  })

  it('keeps document titles within a reasonable SERP length', () => {
    const routes = Object.values(siteRoutes)

    for (const route of routes) {
      expect(getRouteHeadData(route).documentTitle.length).toBeLessThanOrEqual(60)
    }
  })

  it('emits WebSite JSON-LD on the home route only', () => {
    const home = getRouteHeadData(siteRoutes.home)
    const about = getRouteHeadData(siteRoutes.about)

    expect(home.jsonLd).toHaveProperty('@graph')
    expect(about.jsonLd).toMatchObject({ '@type': 'WebPage' })
    expect(about.jsonLd).not.toHaveProperty('@graph')
  })
})

describe('renderRouteHeadHtml', () => {
  it('includes crawler-visible SEO tags', () => {
    const html = renderRouteHeadHtml(getRouteHeadData(siteRoutes.contact))

    expect(html).toContain('<title>Contact — Agents Repo</title>')
    expect(html).toContain('meta name="description"')
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('property="og:title"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).toContain('application/ld+json')
  })
})

describe('injectRouteHeadIntoHtml', () => {
  it('replaces the default title and injects route metadata', () => {
    const baseHtml = `<!doctype html><html><head><title>Agents Repo</title></head><body></body></html>`
    const result = injectRouteHeadIntoHtml(baseHtml, siteRoutes.helpUs)

    expect(result).toContain('<title>Help Us — Agents Repo</title>')
    expect(result).not.toContain('<title>Agents Repo</title>')
    expect(buildRouteHead(siteRoutes.helpUs)).toBeTruthy()
  })
})

describe('injectSpaFallbackHeadIntoHtml', () => {
  it('marks the SPA fallback as non-indexable without a canonical', () => {
    const baseHtml = `<!doctype html><html><head><title>Agents Repo</title></head><body></body></html>`
    const result = injectSpaFallbackHeadIntoHtml(baseHtml)

    expect(result).toContain('<title>Page not found — Agents Repo</title>')
    expect(result).toContain('name="robots" content="noindex, nofollow"')
    expect(result).not.toContain('rel="canonical"')
    expect(result).not.toContain('application/ld+json')
    expect(result).not.toContain('name="description"')
  })
})
