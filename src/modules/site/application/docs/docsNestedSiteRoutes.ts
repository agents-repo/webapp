import { DOCS_BASE_PATH, getDocCatalogEntry } from './docsCatalog.ts'

export function parseDocSlugFromPathname(pathname: string): string | undefined {
  const normalized = normalizeDocsPathname(pathname)

  if (normalized === DOCS_BASE_PATH) {
    return undefined
  }

  const prefix = `${DOCS_BASE_PATH}/`
  if (!normalized.startsWith(prefix)) {
    return undefined
  }

  const slug = normalized.slice(prefix.length)
  if (!slug || slug.includes('/')) {
    return undefined
  }

  return getDocCatalogEntry(slug) ? slug : undefined
}

export function isUnlistedDocDetailPath(pathname: string): boolean {
  const normalized = normalizeDocsPathname(pathname)

  if (normalized === DOCS_BASE_PATH) {
    return false
  }

  const prefix = `${DOCS_BASE_PATH}/`
  if (!normalized.startsWith(prefix)) {
    return false
  }

  return parseDocSlugFromPathname(normalized) === undefined
}

function normalizeDocsPathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}
