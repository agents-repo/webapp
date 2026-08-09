import { getGuideCatalogEntry, GUIDE_BASE_PATH } from './guideCatalog.ts'

export function parseGuideSlugFromPathname(pathname: string): string | undefined {
  const normalized = normalizeGuidePathname(pathname)

  if (normalized === GUIDE_BASE_PATH) {
    return undefined
  }

  const prefix = `${GUIDE_BASE_PATH}/`
  if (!normalized.startsWith(prefix)) {
    return undefined
  }

  const slug = normalized.slice(prefix.length)
  if (!slug || slug.includes('/')) {
    return undefined
  }

  return getGuideCatalogEntry(slug) ? slug : undefined
}

export function isUnlistedGuideDetailPath(pathname: string): boolean {
  const normalized = normalizeGuidePathname(pathname)

  if (normalized === GUIDE_BASE_PATH) {
    return false
  }

  const prefix = `${GUIDE_BASE_PATH}/`
  if (!normalized.startsWith(prefix)) {
    return false
  }

  return parseGuideSlugFromPathname(normalized) === undefined
}

function normalizeGuidePathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}
