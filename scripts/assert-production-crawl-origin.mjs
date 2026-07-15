import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  everyUrlHasOrigin,
  parseRobotsSitemapUrls,
  parseSitemapLocUrls,
  someUrlHasHostname,
} from './crawl-file-url-validation.mjs'
import { previewTestHostname } from '../test/crawl-file-origins.mjs'
import { resolveBuildSiteOrigin } from './seo-build-config.ts'

const distDir = resolve(process.cwd(), 'dist')
const origin = resolveBuildSiteOrigin('production')
const sitemapPath = resolve(distDir, 'sitemap.xml')
const robotsPath = resolve(distDir, 'robots.txt')

const sitemap = readFileSync(sitemapPath, 'utf8')
const robots = readFileSync(robotsPath, 'utf8')
const sitemapUrls = parseSitemapLocUrls(sitemap)
const robotsUrls = parseRobotsSitemapUrls(robots)

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!everyUrlHasOrigin(sitemapUrls, origin)) {
  fail(`dist/sitemap.xml must contain only URLs with origin ${origin}`)
}

if (!everyUrlHasOrigin(robotsUrls, origin)) {
  fail(`dist/robots.txt must contain only Sitemap URLs with origin ${origin}`)
}

if (someUrlHasHostname(sitemapUrls, previewTestHostname)) {
  fail(`dist/sitemap.xml must not contain hostname ${previewTestHostname}`)
}

if (someUrlHasHostname(robotsUrls, previewTestHostname)) {
  fail(`dist/robots.txt must not contain hostname ${previewTestHostname}`)
}
