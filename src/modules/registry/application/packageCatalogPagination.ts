export const PACKAGE_CATALOG_PAGE_SIZE = 9
export const PACKAGE_CATALOG_PAGE_PARAM = 'page'
export const PACKAGE_CATALOG_PAGINATION_ELLIPSIS_AFTER = 7

export type PackageCatalogPageItem = number | 'ellipsis-start' | 'ellipsis-end'

export function parsePackageCatalogPage(searchParams: URLSearchParams): number {
  const raw = (searchParams.get(PACKAGE_CATALOG_PAGE_PARAM) ?? '').trim()
  if (!/^[1-9]\d*$/.test(raw)) {
    return 1
  }

  return Number.parseInt(raw, 10)
}

export function applyPackageCatalogPageToSearchParams(
  searchParams: URLSearchParams,
  page: number,
): URLSearchParams {
  const next = new URLSearchParams(searchParams)
  if (page <= 1) {
    next.delete(PACKAGE_CATALOG_PAGE_PARAM)
  } else {
    next.set(PACKAGE_CATALOG_PAGE_PARAM, String(page))
  }

  return next
}

export function getPackageCatalogPageCount(itemCount: number): number {
  if (itemCount <= 0) {
    return 1
  }

  return Math.ceil(itemCount / PACKAGE_CATALOG_PAGE_SIZE)
}

export function clampPackageCatalogPage(page: number, pageCount: number): number {
  const maxPage = Math.max(1, pageCount)
  if (!Number.isFinite(page) || page < 1) {
    return 1
  }

  return Math.min(Math.trunc(page), maxPage)
}

export function slicePackageCatalogPage<T>(items: readonly T[], page: number): readonly T[] {
  const currentPage = clampPackageCatalogPage(page, getPackageCatalogPageCount(items.length))
  const start = (currentPage - 1) * PACKAGE_CATALOG_PAGE_SIZE
  return items.slice(start, start + PACKAGE_CATALOG_PAGE_SIZE)
}

export function getPackageCatalogPageWindow(
  filteredCount: number,
  page: number,
): { readonly start: number; readonly end: number } | null {
  if (filteredCount <= PACKAGE_CATALOG_PAGE_SIZE) {
    return null
  }

  const currentPage = clampPackageCatalogPage(page, getPackageCatalogPageCount(filteredCount))
  const start = (currentPage - 1) * PACKAGE_CATALOG_PAGE_SIZE + 1
  const end = Math.min(currentPage * PACKAGE_CATALOG_PAGE_SIZE, filteredCount)
  return { start, end }
}

export function getPackageCatalogPaginationItems(
  currentPage: number,
  pageCount: number,
): readonly PackageCatalogPageItem[] {
  if (pageCount <= 1) {
    return []
  }

  if (pageCount <= PACKAGE_CATALOG_PAGINATION_ELLIPSIS_AFTER) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  let windowStart = Math.max(2, currentPage - 1)
  let windowEnd = Math.min(pageCount - 1, currentPage + 1)

  if (currentPage <= 2) {
    windowStart = 2
    windowEnd = Math.min(pageCount - 1, 3)
  }

  if (currentPage >= pageCount - 1) {
    windowStart = Math.max(2, pageCount - 2)
    windowEnd = pageCount - 1
  }

  const items: PackageCatalogPageItem[] = [1]
  if (windowStart > 2) {
    items.push('ellipsis-start')
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page)
  }

  if (windowEnd < pageCount - 1) {
    items.push('ellipsis-end')
  }

  items.push(pageCount)
  return items
}
