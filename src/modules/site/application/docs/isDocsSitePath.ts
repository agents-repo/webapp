import { DOCS_BASE_PATH } from './docsCatalog.ts'

function normalizeDocsPathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}

/** True when `pathname` is the docs index or a docs article (locale prefix already stripped). */
export function isDocsSitePath(pathnameWithoutLocale: string): boolean {
  const normalized = normalizeDocsPathname(pathnameWithoutLocale)
  return normalized === DOCS_BASE_PATH || normalized.startsWith(`${DOCS_BASE_PATH}/`)
}
