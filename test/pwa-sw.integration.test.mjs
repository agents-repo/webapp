import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'
import {
  APP_STATIC_RUNTIME_CACHE_NAME,
  CRAWL_FILE_NAVIGATE_DENYLIST,
  HTML_PAGES_CACHE_NAME,
  HTML_PAGES_MAX_AGE_SECONDS,
} from '../scripts/pwa-workbox.ts'

const distDir = resolve(process.cwd(), 'dist')
const swPath = resolve(distDir, 'sw.js')

function requireGeneratedServiceWorker() {
  if (!existsSync(swPath)) {
    throw new Error(
      'Missing dist/sw.js. Run npm run build:pages before validating the generated service worker.',
    )
  }
}

function parsePrecacheUrls(swSource) {
  return [...swSource.matchAll(/[{,]\s*"url"\s*:\s*"([^"]+)"/g)].map((match) => match[1])
}

describe('generated PWA service worker', { concurrency: 1 }, () => {
  it('uses NetworkFirst HTML caching and does not freeze a precached shell', () => {
    requireGeneratedServiceWorker()
    const swSource = readFileSync(swPath, 'utf8')
    const precacheUrls = parsePrecacheUrls(swSource)

    assert.equal(swSource.includes(HTML_PAGES_CACHE_NAME), true)
    assert.equal(swSource.includes(APP_STATIC_RUNTIME_CACHE_NAME), true)
    assert.equal(swSource.includes('NetworkFirst'), true)
    assert.equal(swSource.includes(String(HTML_PAGES_MAX_AGE_SECONDS)), true)
    assert.match(swSource, /directoryIndex:\s*null/)
    assert.equal(swSource.includes('NavigationRoute'), false)
    assert.equal(swSource.includes('createHandlerBoundToURL'), false)
    assert.equal(
      precacheUrls.some((url) => /\.html(?:\?|$)/i.test(url)),
      false,
      `precache must not include HTML: ${precacheUrls.filter((url) => /\.html(?:\?|$)/i.test(url)).join(', ')}`,
    )

    for (const pattern of CRAWL_FILE_NAVIGATE_DENYLIST) {
      assert.equal(swSource.includes(pattern.source), true, pattern.source)
    }
  })
})
