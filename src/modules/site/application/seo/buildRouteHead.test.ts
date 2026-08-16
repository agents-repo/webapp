import { describe, expect, it } from 'vitest'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog'
import { siteRoutes } from '../../presentation/routes/siteRoutes'
import {
  buildRouteHead,
  getRouteHeadData,
  injectLegacyDomainRedirectIntoHtml,
  injectRouteHeadIntoHtml,
  injectSpaFallbackHeadIntoHtml,
  renderRouteHeadHtml,
} from './buildRouteHead'

describe('getRouteHeadData', () => {
  it('uses absolute canonical and OG image URLs', () => {
    const head = getRouteHeadData(siteRoutes.about, 'https://agents-repo.org')

    expect(head.canonicalUrl).toBe('https://agents-repo.org/about')
    expect(head.ogUrl).toBe(head.canonicalUrl)
    expect(head.ogImage).toBe('https://agents-repo.org/og-image.jpg')
    expect(head.ogImage).toMatch(/^https:\/\//)
  })

  it('keeps document titles within a reasonable SERP length', () => {
    const routes = Object.values(siteRoutes)

    for (const route of routes) {
      expect(getRouteHeadData(route).documentTitle.length).toBeLessThanOrEqual(60)
    }
  })

  it('emits CollectionPage JSON-LD on package indexes and SoftwareSourceCode on detail', () => {
    const indexHead = getRouteHeadData(siteRoutes.packages)
    const namespaceHead = getRouteHeadData('/packages/agents-repo', 'https://agents-repo.org', {
      catalog: sampleRegistryCatalog,
    })
    const detailHead = getRouteHeadData('/packages/agents-repo/sample-agent', 'https://agents-repo.org', {
      catalog: sampleRegistryCatalog,
      githubRepositoryUrl: 'https://github.com/agents-repo/registry/tree/v2.x',
    })

    expect(indexHead.jsonLd).toMatchObject({ '@type': 'CollectionPage' })
    expect(namespaceHead.jsonLd).toMatchObject({ '@type': 'CollectionPage' })
    expect(detailHead.jsonLd).toMatchObject({
      '@type': 'SoftwareSourceCode',
      codeRepository:
        'https://github.com/agents-repo/registry/tree/v2.x/packages/agents-repo/sample-agent',
    })
  })

  it('emits WebSite JSON-LD on the home route only', () => {
    const home = getRouteHeadData(siteRoutes.home)
    const about = getRouteHeadData(siteRoutes.about)

    expect(home.jsonLd).toHaveProperty('@graph')
    expect(about.jsonLd).toMatchObject({ '@type': 'WebPage' })
    expect(about.jsonLd).not.toHaveProperty('@graph')
  })

  it('includes Organization sameAs profiles on the home route', () => {
    const home = getRouteHeadData(siteRoutes.home)
    const graph = home.jsonLd['@graph'] as Array<Record<string, unknown>>
    const organization = graph.find((node) => node['@type'] === 'Organization')

    expect(organization?.sameAs).toEqual([
      'https://x.com/AgentsRepo',
      'https://www.reddit.com/r/agentsrepo/',
      'https://github.com/agents-repo',
    ])
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
    expect(html).toContain('name="twitter:site" content="@AgentsRepo"')
    expect(html).toContain('property="og:image" content="https://agents-repo.org/og-image.jpg"')
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

describe('injectLegacyDomainRedirectIntoHtml', () => {
  it('injects an early redirect from github.io to the custom domain', () => {
    const baseHtml = `<!doctype html><html><head><title>Agents Repo</title></head><body></body></html>`
    const result = injectLegacyDomainRedirectIntoHtml(baseHtml)

    expect(result).toContain("location.hostname === 'agents-repo.github.io'")
    expect(result).toContain("location.replace('https://agents-repo.org'")
    expect(result.indexOf('<script>')).toBeLessThan(result.indexOf('<title>'))
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
