const fileUrlSegmentPattern = /\.[a-z0-9]+$/i

function splitPathAndSuffix(pathname: string): { readonly pathOnly: string; readonly suffix: string } {
  const queryIndex = pathname.indexOf('?')
  const hashIndex = pathname.indexOf('#')
  const splitCandidates = [queryIndex, hashIndex].filter((index) => index >= 0)
  if (splitCandidates.length === 0) {
    return { pathOnly: pathname, suffix: '' }
  }

  const splitAt = Math.min(...splitCandidates)
  return { pathOnly: pathname.slice(0, splitAt), suffix: pathname.slice(splitAt) }
}

export function normalizeSitePathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}

export function publicSitePath(pathname: string): string {
  const { pathOnly, suffix } = splitPathAndSuffix(pathname)
  const normalized = normalizeSitePathname(pathOnly.length > 0 ? pathOnly : '/')

  if (normalized === '/') {
    return `/${suffix}`
  }

  const lastSegment = normalized.slice(normalized.lastIndexOf('/') + 1)
  if (fileUrlSegmentPattern.test(lastSegment)) {
    return `${normalized}${suffix}`
  }

  return `${normalized}/${suffix}`
}
