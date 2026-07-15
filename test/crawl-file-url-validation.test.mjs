import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  everyRobotsSitemapUrlPointsToSitemap,
  everyUrlHasOrigin,
  parseRobotsSitemapUrls,
  parseSitemapLocUrls,
  requireDistCrawlFiles,
  someUrlHasHostname,
  urlHasHostname,
  urlHasOrigin,
} from '../scripts/crawl-file-url-validation.mjs'
import { previewTestHostname, previewTestOrigin } from '../scripts/crawl-file-origins.mjs'

const productionOrigin = 'https://agents-repo.org'

describe('crawl-file-url-validation', () => {
  it('matches origins by parsed URL instead of substring', () => {
    assert.equal(urlHasOrigin('https://agents-repo.org/about', productionOrigin), true)
    assert.equal(
      urlHasOrigin('https://agents-repo.org.evil.com/about', productionOrigin),
      false,
    )
    assert.equal(
      urlHasOrigin('https://evil.com/https://agents-repo.org/', productionOrigin),
      false,
    )
  })

  it('matches hostnames by parsed URL instead of substring', () => {
    assert.equal(urlHasHostname(previewTestOrigin, previewTestHostname), true)
    assert.equal(urlHasHostname('https://preview.example.test.evil.com/', previewTestHostname), false)
    assert.equal(
      urlHasHostname('https://evil.com/?q=https://preview.example.test', previewTestHostname),
      false,
    )
  })

  it('validates sitemap and robots URL lists', () => {
    const sitemap = `<url><loc>${productionOrigin}/</loc></url>`
    const robots = `User-agent: *\nAllow: /\nSitemap: ${productionOrigin}/sitemap.xml`

    assert.equal(everyUrlHasOrigin(parseSitemapLocUrls(sitemap), productionOrigin), true)
    assert.equal(everyUrlHasOrigin(parseRobotsSitemapUrls(robots), productionOrigin), true)
    assert.equal(someUrlHasHostname(parseSitemapLocUrls(sitemap), previewTestHostname), false)
  })

  it('rejects robots sitemap URLs that use the correct origin but wrong path', () => {
    const robots = `User-agent: *\nAllow: /\nSitemap: ${productionOrigin}/wrong.xml`
    const robotsUrls = parseRobotsSitemapUrls(robots)

    assert.equal(everyUrlHasOrigin(robotsUrls, productionOrigin), true)
    assert.equal(everyRobotsSitemapUrlPointsToSitemap(robotsUrls, productionOrigin), false)
  })

  it('parses pretty-printed sitemap loc values', () => {
    const sitemap = `<url><loc>\n  ${productionOrigin}/about\n</loc></url>`

    assert.deepEqual(parseSitemapLocUrls(sitemap), [`${productionOrigin}/about`])
  })

  it('treats origins with extra trailing slashes as equivalent', () => {
    assert.equal(
      urlHasOrigin(`${productionOrigin}/about`, `${productionOrigin}///`),
      true,
    )
  })

  it('reports missing crawl files with an actionable error', () => {
    const emptyDistDir = mkdtempSync(join(tmpdir(), 'webapp-crawl-files-'))

    try {
      assert.throws(
        () => requireDistCrawlFiles(emptyDistDir, 'npm run build:pages'),
        /Missing dist crawl file\(s\): sitemap\.xml, robots\.txt/,
      )
    } finally {
      rmSync(emptyDistDir, { recursive: true, force: true })
    }
  })
})
