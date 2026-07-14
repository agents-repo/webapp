/* eslint-disable sonarjs/no-os-command-from-path -- integration test shells out to npm run build for custom origin */
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { before, describe, it } from 'node:test'
import { resolveBuildSiteOrigin } from '../scripts/seo-build-config.ts'
import { getSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'

const distDir = resolve(process.cwd(), 'dist')

function parseSitemapEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: match[1].match(/<loc>(.*?)<\/loc>/)?.[1],
    priority: match[1].match(/<priority>(.*?)<\/priority>/)?.[1],
    changefreq: match[1].match(/<changefreq>(.*?)<\/changefreq>/)?.[1],
  }))
}

function assertCrawlFilesMatchOrigin(origin) {
  const xml = readFileSync(resolve(distDir, 'sitemap.xml'), 'utf8')
  const robots = readFileSync(resolve(distDir, 'robots.txt'), 'utf8')
  const routes = getSiteRoutePaths()
  const entries = parseSitemapEntries(xml)

  assert.equal(entries.length, routes.length)

  for (const route of routes) {
    const loc = route === '/' ? `${origin}/` : `${origin}${route}`
    const entry = entries.find((item) => item.loc === loc)
    assert.ok(entry, `missing sitemap entry for ${loc}`)
    assert.equal(entry.changefreq, 'monthly')
    assert.equal(entry.priority, route === '/' ? '1.0' : '0.8')
  }

  assert.ok(robots.includes('User-agent: *'))
  assert.ok(robots.includes('Allow: /'))
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`))
}

describe('crawl files integration', () => {
  it('writes sitemap.xml and robots.txt for the default production origin', () => {
    assertCrawlFilesMatchOrigin(resolveBuildSiteOrigin('production'))
  })
})

describe('crawl files integration with custom VITE_SITE_URL', () => {
  const customOrigin = 'https://preview.example.test'

  before(() => {
    execSync('npm run build', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_SITE_URL: customOrigin,
        FORCE_COLOR: '0',
      },
    })
  })

  it('writes crawl files using VITE_SITE_URL from the shell', () => {
    assertCrawlFilesMatchOrigin(customOrigin)
  })
})
