import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  everyRobotsSitemapUrlPointsToSitemap,
  everyUrlHasOrigin,
  parseRobotsSitemapUrls,
  parseSitemapLocUrls,
  requireDistCrawlFiles,
  someUrlHasHostname,
} from './crawl-file-url-validation.mjs'
import { previewTestHostname } from './crawl-file-origins.mjs'
import { resolveBuildSiteOrigin } from './seo-build-config.ts'

const distDir = resolve(process.cwd(), 'dist')
const origin = resolveBuildSiteOrigin('production')
const sitemapPath = resolve(distDir, 'sitemap.xml')
const robotsPath = resolve(distDir, 'robots.txt')

function fail(message) {
  console.error(message)
  process.exit(1)
}

try {
  requireDistCrawlFiles(distDir, 'npm run build:pages')
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}

const sitemap = readFileSync(sitemapPath, 'utf8')
const robots = readFileSync(robotsPath, 'utf8')
const sitemapUrls = parseSitemapLocUrls(sitemap)
const robotsUrls = parseRobotsSitemapUrls(robots)

if (!everyUrlHasOrigin(sitemapUrls, origin)) {
  fail(`dist/sitemap.xml must contain only URLs with origin ${origin}`)
}

if (!everyUrlHasOrigin(robotsUrls, origin)) {
  fail(`dist/robots.txt must contain only Sitemap URLs with origin ${origin}`)
}

if (!everyRobotsSitemapUrlPointsToSitemap(robotsUrls, origin)) {
  fail(`dist/robots.txt must reference ${origin}/sitemap.xml`)
}

if (someUrlHasHostname(sitemapUrls, previewTestHostname)) {
  fail(`dist/sitemap.xml must not contain hostname ${previewTestHostname}`)
}

if (someUrlHasHostname(robotsUrls, previewTestHostname)) {
  fail(`dist/robots.txt must not contain hostname ${previewTestHostname}`)
}
