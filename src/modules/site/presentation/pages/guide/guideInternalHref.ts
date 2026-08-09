import { GUIDE_BASE_PATH } from '../../../application/guide/guideCatalog.ts'
import { REPOSITORIES_BASE_PATH } from '../../../application/nestedSiteRoutes.ts'
import { isKnownSiteRoute, normalizeSitePathname } from '../../routes/siteRoutes.ts'

function pathnameFromRelativeHref(href: string): string | undefined {
  if (!href.startsWith('/') || href.startsWith('//')) {
    return undefined
  }

  const pathEnd = href.search(/[?#]/)
  const pathOnly = pathEnd === -1 ? href : href.slice(0, pathEnd)
  return normalizeSitePathname(pathOnly)
}

function isSingleSegmentNestedPath(pathname: string, basePath: string): boolean {
  if (!pathname.startsWith(`${basePath}/`)) {
    return false
  }

  const remainder = pathname.slice(basePath.length + 1)
  return remainder.length > 0 && !remainder.includes('/')
}

export function isInternalSiteHref(href: string): boolean {
  const pathname = pathnameFromRelativeHref(href)
  if (pathname === undefined) {
    return false
  }

  if (isKnownSiteRoute(pathname)) {
    return true
  }

  return (
    isSingleSegmentNestedPath(pathname, GUIDE_BASE_PATH) ||
    isSingleSegmentNestedPath(pathname, REPOSITORIES_BASE_PATH)
  )
}
