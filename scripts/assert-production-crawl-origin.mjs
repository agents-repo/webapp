import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { previewTestOrigin } from '../test/crawl-file-origins.mjs'
import { resolveBuildSiteOrigin } from './seo-build-config.ts'

const distDir = resolve(process.cwd(), 'dist')
const origin = resolveBuildSiteOrigin('production')
const sitemapPath = resolve(distDir, 'sitemap.xml')
const robotsPath = resolve(distDir, 'robots.txt')

const sitemap = readFileSync(sitemapPath, 'utf8')
const robots = readFileSync(robotsPath, 'utf8')

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!sitemap.includes(`${origin}/`)) {
  fail(`dist/sitemap.xml is missing production origin ${origin}`)
}

if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
  fail(`dist/robots.txt is missing Sitemap: ${origin}/sitemap.xml`)
}

if (sitemap.includes(previewTestOrigin)) {
  fail(`dist/sitemap.xml must not contain test-only origin ${previewTestOrigin}`)
}

if (robots.includes(previewTestOrigin)) {
  fail(`dist/robots.txt must not contain test-only origin ${previewTestOrigin}`)
}
