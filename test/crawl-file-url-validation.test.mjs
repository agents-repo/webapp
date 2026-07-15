import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  everyUrlHasOrigin,
  parseRobotsSitemapUrls,
  parseSitemapLocUrls,
  requireDistCrawlFiles,
  someUrlHasHostname,
  urlHasHostname,
  urlHasOrigin,
} from '../scripts/crawl-file-url-validation.mjs'
import { previewTestHostname, previewTestOrigin } from './crawl-file-origins.mjs'

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

  it('reports missing crawl files with an actionable error', () => {
    const emptyDistDir = mkdtempSync(join(tmpdir(), 'webapp-crawl-files-'))

    assert.throws(
      () => requireDistCrawlFiles(emptyDistDir, 'npm run build:pages'),
      /Missing dist crawl file\(s\): sitemap\.xml, robots\.txt/,
    )
  })
})
