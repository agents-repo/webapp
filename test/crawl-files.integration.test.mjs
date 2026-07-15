import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'
import {
  everyUrlHasOrigin,
  parseRobotsSitemapUrls,
  parseSitemapLocUrls,
  requireDistCrawlFiles,
  someUrlHasHostname,
} from '../scripts/crawl-file-url-validation.mjs'
import { resolveBuildSiteOrigin } from '../scripts/seo-build-config.ts'
import { getSiteRoutePaths } from '../src/modules/site/presentation/routes/siteRoutes.ts'
import { previewTestHostname } from '../scripts/crawl-file-origins.mjs'

const distDir = resolve(process.cwd(), 'dist')

function parseSitemapEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: match[1].match(/<loc>(.*?)<\/loc>/)?.[1],
    priority: match[1].match(/<priority>(.*?)<\/priority>/)?.[1],
    changefreq: match[1].match(/<changefreq>(.*?)<\/changefreq>/)?.[1],
  }))
}

function requireCrawlFiles() {
  requireDistCrawlFiles(distDir, 'npm run build:pages')
}

function assertCrawlFileUrlsUseOnlyOrigin(urlStrings, fileName, origin) {
  assert.ok(
    everyUrlHasOrigin(urlStrings, origin),
    `${fileName} must contain only URLs with origin ${origin}`,
  )
  assert.ok(
    !someUrlHasHostname(urlStrings, previewTestHostname),
    `${fileName} must not contain hostname ${previewTestHostname}`,
  )
}

function assertCrawlFilesMatchOrigin(origin) {
  requireCrawlFiles()
  const xml = readFileSync(resolve(distDir, 'sitemap.xml'), 'utf8')
  const robots = readFileSync(resolve(distDir, 'robots.txt'), 'utf8')
  const routes = getSiteRoutePaths()
  const entries = parseSitemapEntries(xml)
  const sitemapUrls = parseSitemapLocUrls(xml)
  const robotsUrls = parseRobotsSitemapUrls(robots)

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
  assertCrawlFileUrlsUseOnlyOrigin(sitemapUrls, 'sitemap.xml', origin)
  assertCrawlFileUrlsUseOnlyOrigin(robotsUrls, 'robots.txt', origin)
}

describe('crawl files integration', { concurrency: 1 }, () => {
  it('matches sitemap.xml and robots.txt for the production origin', () => {
    assertCrawlFilesMatchOrigin(resolveBuildSiteOrigin('production'))
  })
})
