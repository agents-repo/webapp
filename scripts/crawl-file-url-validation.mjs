import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export function requireDistCrawlFiles(
  distDir,
  actionLabel = 'npm run build:pages',
) {
  const missing = ['sitemap.xml', 'robots.txt'].filter((name) => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- distDir plus fixed crawl file names
    return !existsSync(resolve(distDir, name))
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing dist crawl file(s): ${missing.join(', ')}. Run ${actionLabel} before validating crawl files.`,
    )
  }
}

export function parseSitemapLocUrls(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1].trim())
}

export function parseRobotsSitemapUrls(robots) {
  return robots
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().startsWith('sitemap:'))
    .map((line) => line.slice(line.indexOf(':') + 1).trim())
}

function parseUrl(urlString) {
  try {
    return new URL(urlString)
  } catch {
    return null
  }
}

export function normalizeSiteOrigin(origin) {
  let normalized = origin
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

export function urlHasOrigin(urlString, expectedOrigin) {
  const parsed = parseUrl(urlString)
  if (!parsed) {
    return false
  }

  return parsed.origin === normalizeSiteOrigin(expectedOrigin)
}

export function urlHasHostname(urlString, hostname) {
  const parsed = parseUrl(urlString)
  if (!parsed) {
    return false
  }

  return parsed.hostname === hostname
}

export function everyUrlHasOrigin(urlStrings, expectedOrigin) {
  return urlStrings.length > 0 && urlStrings.every((url) => urlHasOrigin(url, expectedOrigin))
}

export function someUrlHasHostname(urlStrings, hostname) {
  return urlStrings.some((url) => urlHasHostname(url, hostname))
}
