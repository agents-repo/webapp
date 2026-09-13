import { describe, expect, it } from 'vitest'
import { samplePackageDetail } from '../../../../test/fixtures/samplePackageDetail.ts'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog.ts'
import { siteRoutes } from '../../presentation/routes/siteRoutes.ts'
import {
  injectRouteBodyFallbackIntoHtml,
  renderRouteBodyFallbackHtml,
  STATIC_ROUTE_FALLBACK_ID,
} from './routeBodyFallback.ts'

const baseHtml = `<!doctype html><html><body><div id="root"></div></body></html>`

describe('renderRouteBodyFallbackHtml', () => {
  it('renders homepage fallback with catalog links', () => {
    const html = renderRouteBodyFallbackHtml(siteRoutes.home, 'https://agents-repo.org')

    expect(html).toContain(`id="${STATIC_ROUTE_FALLBACK_ID}"`)
    expect(html).toContain('<noscript')
    expect(html).toContain('https://agents-repo.org/packages/')
    expect(html).toContain('https://agents-repo.org/llms.txt')
    expect(html).toContain('https://agents-repo.org/docs/for-ai-agents.md')
    expect(html).toContain('<h1>Agents Repo</h1>')
    expect(html).not.toContain('Agents Repo — Agents Repo')
  })

  it('renders localized homepage fallback with catalog links', () => {
    const html = renderRouteBodyFallbackHtml('/es/', 'https://agents-repo.org')

    expect(html).toContain(`id="${STATIC_ROUTE_FALLBACK_ID}"`)
    expect(html).toContain('https://agents-repo.org/llms.txt')
    expect(html).toContain('https://agents-repo.org/docs/for-ai-agents.md')
  })

  it('renders package detail fallback with markdown link and readme excerpt', () => {
    const html = renderRouteBodyFallbackHtml(
      '/packages/agents-repo/sample-agent',
      'https://agents-repo.org',
      {
        catalog: sampleRegistryCatalog,
        packageDetail: samplePackageDetail,
      },
    )

    expect(html).toContain('/packages/agents-repo/sample-agent.md')
    expect(html).toContain('README excerpt')
    expect(html).toContain('sample-agent')
  })

  it('renders localized package detail fallback with markdown link', () => {
    const html = renderRouteBodyFallbackHtml(
      '/es/packages/agents-repo/sample-agent',
      'https://agents-repo.org',
      {
        catalog: sampleRegistryCatalog,
        packageDetail: samplePackageDetail,
      },
    )

    expect(html).toContain('/packages/agents-repo/sample-agent.md')
    expect(html).toContain('README excerpt')
  })
})

describe('injectRouteBodyFallbackIntoHtml', () => {
  it('injects fallback before #root without duplicating on repeat', () => {
    const once = injectRouteBodyFallbackIntoHtml(baseHtml, siteRoutes.home, 'https://agents-repo.org')
    const twice = injectRouteBodyFallbackIntoHtml(once, siteRoutes.home, 'https://agents-repo.org')

    expect(once.indexOf('<noscript')).toBeLessThan(once.indexOf('<div id="root"></div>'))
    expect(once.match(/id="static-route-fallback"/g)?.length).toBe(1)
    expect(twice.match(/id="static-route-fallback"/g)?.length).toBe(1)
  })
})
