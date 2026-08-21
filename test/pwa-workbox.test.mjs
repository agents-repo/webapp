import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CRAWL_FILE_NAVIGATE_DENYLIST,
  WORKBOX_GLOB_PATTERNS,
  isCrawlFilePath,
  isHtmlNavigationRequest,
  isStaticAssetRuntimeRequest,
} from '../scripts/pwa-workbox.ts'

function context({
  pathname,
  origin = 'https://agents-repo.org',
  sameOrigin = true,
  method = 'GET',
  mode,
  destination,
}) {
  return {
    request: { method, mode, destination },
    url: new URL(pathname, origin),
    sameOrigin,
  }
}

describe('pwa-workbox matchers', () => {
  it('treats home and site HTML paths as crawl-file exclusions only when listed', () => {
    assert.equal(isCrawlFilePath('/'), false)
    assert.equal(isCrawlFilePath('/about/'), false)
    assert.equal(isCrawlFilePath('/sitemap.xml'), true)
    assert.equal(isCrawlFilePath('/robots.txt'), true)
    assert.equal(isCrawlFilePath('/llms.txt'), true)
    assert.equal(isCrawlFilePath('/docs/getting-started.md'), true)
    assert.equal(isCrawlFilePath('/docs/getting-started'), false)
  })

  it('matches HTML navigations for same-origin GET document requests', () => {
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/', mode: 'navigate' })),
      true,
    )
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/about/', mode: 'navigate' })),
      true,
    )
  })

  it('skips crawl-file navigations, non-GET, and cross-origin requests', () => {
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/sitemap.xml', mode: 'navigate' })),
      false,
    )
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/robots.txt', mode: 'navigate' })),
      false,
    )
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/llms.txt', mode: 'navigate' })),
      false,
    )
    assert.equal(
      isHtmlNavigationRequest(
        context({ pathname: '/docs/getting-started.md', mode: 'navigate' }),
      ),
      false,
    )
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/', mode: 'navigate', method: 'POST' })),
      false,
    )
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/', mode: 'navigate', sameOrigin: false })),
      false,
    )
    assert.equal(
      isHtmlNavigationRequest(context({ pathname: '/', destination: 'script' })),
      false,
    )
  })

  it('matches same-origin static assets and skips JSON', () => {
    assert.equal(
      isStaticAssetRuntimeRequest(context({ pathname: '/assets/app.js', destination: 'script' })),
      true,
    )
    assert.equal(
      isStaticAssetRuntimeRequest(context({ pathname: '/assets/app.css', destination: 'style' })),
      true,
    )
    assert.equal(
      isStaticAssetRuntimeRequest(
        context({ pathname: '/packages/index.json', destination: 'script' }),
      ),
      false,
    )
    assert.equal(
      isStaticAssetRuntimeRequest(
        context({ pathname: '/assets/app.js', destination: 'script', sameOrigin: false }),
      ),
      false,
    )
  })

  it('keeps navigateFallback denylist aligned with crawl-file path checks', () => {
    const crawlPaths = ['/sitemap.xml', '/robots.txt', '/llms.txt', '/docs/getting-started.md']

    assert.equal(CRAWL_FILE_NAVIGATE_DENYLIST.length, crawlPaths.length)
    for (const pathname of crawlPaths) {
      assert.equal(
        CRAWL_FILE_NAVIGATE_DENYLIST.some((pattern) => pattern.test(pathname)),
        true,
        pathname,
      )
    }
  })

  it('serializes HTML navigation matching without other module helpers', () => {
    const source = isHtmlNavigationRequest.toString()

    assert.equal(source.includes('isCrawlFilePath'), false)
    assert.equal(source.includes('sitemap'), true)
    assert.equal(source.includes('robots'), true)
    assert.equal(source.includes('llms'), true)
  })

  it('does not glob HTML into the service worker precache', () => {
    assert.equal(
      WORKBOX_GLOB_PATTERNS.some((pattern) => pattern.includes('html')),
      false,
    )
  })
})
