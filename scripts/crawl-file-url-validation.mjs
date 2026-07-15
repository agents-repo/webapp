export function parseSitemapLocUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim())
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
  return origin.replace(/\/$/, '')
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
