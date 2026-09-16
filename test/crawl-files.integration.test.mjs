import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'
import {
  everyRobotsSitemapUrlPointsToSitemap,
  everyUrlHasOrigin,
  parseRobotsSitemapUrls,
  parseSitemapLocUrls,
  requireDistCrawlFiles,
  someUrlHasHostname,
} from '../scripts/crawl-file-url-validation.mjs'
import { STATIC_ROUTE_FALLBACK_ID } from '../src/modules/site/application/seo/routeBodyFallback.ts'
import { getBuildSitemapPaths, publicSitePath, resolveBuildSiteOrigin } from '../scripts/seo-build-config.ts'
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
  const routes = getBuildSitemapPaths()
  const entries = parseSitemapEntries(xml)
  const sitemapUrls = parseSitemapLocUrls(xml)
  const robotsUrls = parseRobotsSitemapUrls(robots)

  assert.equal(entries.length, routes.length)

  for (const route of routes) {
    const loc = `${origin}${publicSitePath(route)}`
    const entry = entries.find((item) => item.loc === loc)
    assert.ok(entry, `missing sitemap entry for ${loc}`)
    assert.equal(entry.changefreq, 'monthly')
    assert.equal(entry.priority, route === '/' ? '1.0' : '0.8')
    if (route !== '/') {
      assert.ok(loc.endsWith('/'), `non-home sitemap loc must end with /: ${loc}`)
    }
  }

  assert.ok(robots.includes('User-agent: *'))
  assert.ok(robots.includes('Allow: /'))
  assertCrawlFileUrlsUseOnlyOrigin(sitemapUrls, 'sitemap.xml', origin)
  assertCrawlFileUrlsUseOnlyOrigin(robotsUrls, 'robots.txt', origin)
  assert.ok(
    everyRobotsSitemapUrlPointsToSitemap(robotsUrls, origin),
    `robots.txt must reference ${origin}/sitemap.xml`,
  )
}

describe('crawl files integration', { concurrency: 1 }, () => {
  it('matches sitemap.xml and robots.txt for the production origin', () => {
    assertCrawlFilesMatchOrigin(resolveBuildSiteOrigin('production'))
  })

  it('includes static route fallback content on the homepage HTML shell', () => {
    requireCrawlFiles()
    const homeHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8')

    assert.ok(homeHtml.includes(`id="${STATIC_ROUTE_FALLBACK_ID}"`))
    assert.ok(homeHtml.includes('<noscript'))
    assert.ok(homeHtml.includes('/llms.txt'))
    assert.ok(homeHtml.includes('/packages/'))
  })

  it('writes package markdown fallbacks and lists them in llms.txt', () => {
    requireCrawlFiles()
    const llms = readFileSync(resolve(distDir, 'llms.txt'), 'utf8')
    const packageMarkdownMatch = llms.match(/https:\/\/agents-repo\.org\/packages\/[^/\s]+\/[^/\s]+\.md/)

    assert.ok(packageMarkdownMatch, 'llms.txt must list at least one package markdown fallback URL')

    const packageMarkdownUrl = packageMarkdownMatch[0]
    const packageMarkdownPath = packageMarkdownUrl.replace('https://agents-repo.org', '')
    const packageMarkdown = readFileSync(resolve(distDir, packageMarkdownPath.slice(1)), 'utf8')

    assert.ok(packageMarkdown.startsWith('# '))
    assert.ok(llms.includes('## Package markdown fallbacks'))
    assert.ok(
      llms.includes('https://agents-repo.org/docs/contributing-packages.md'),
      'llms.txt must list contributing-packages doc markdown URL',
    )
  })
})
