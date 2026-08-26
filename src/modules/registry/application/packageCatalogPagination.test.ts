import { describe, expect, it } from 'vitest'
import {
  applyPackageCatalogPageToSearchParams,
  clampPackageCatalogPage,
  getPackageCatalogPageCount,
  getPackageCatalogPageWindow,
  getPackageCatalogPaginationItems,
  PACKAGE_CATALOG_PAGE_SIZE,
  parsePackageCatalogPage,
  slicePackageCatalogPage,
} from './packageCatalogPagination'

describe('packageCatalogPagination', () => {
  it('parses 1-based page numbers and defaults invalid values to 1', () => {
    expect(parsePackageCatalogPage(new URLSearchParams())).toBe(1)
    expect(parsePackageCatalogPage(new URLSearchParams('page=2'))).toBe(2)
    expect(parsePackageCatalogPage(new URLSearchParams('page=1'))).toBe(1)
    expect(parsePackageCatalogPage(new URLSearchParams('page=0'))).toBe(1)
    expect(parsePackageCatalogPage(new URLSearchParams('page=-3'))).toBe(1)
    expect(parsePackageCatalogPage(new URLSearchParams('page=foo'))).toBe(1)
    expect(parsePackageCatalogPage(new URLSearchParams('page=2.5'))).toBe(1)
  })

  it('omits page 1 from the URL and sets later pages', () => {
    const withPage = applyPackageCatalogPageToSearchParams(new URLSearchParams('q=review'), 2)
    expect(withPage.get('page')).toBe('2')
    expect(withPage.get('q')).toBe('review')

    const firstPage = applyPackageCatalogPageToSearchParams(withPage, 1)
    expect(firstPage.get('page')).toBeNull()
    expect(firstPage.get('q')).toBe('review')
  })

  it('counts pages from the filtered length and clamps out-of-range values', () => {
    expect(getPackageCatalogPageCount(0)).toBe(1)
    expect(getPackageCatalogPageCount(PACKAGE_CATALOG_PAGE_SIZE)).toBe(1)
    expect(getPackageCatalogPageCount(PACKAGE_CATALOG_PAGE_SIZE + 1)).toBe(2)
    expect(clampPackageCatalogPage(1, 3)).toBe(1)
    expect(clampPackageCatalogPage(3, 3)).toBe(3)
    expect(clampPackageCatalogPage(99, 2)).toBe(2)
    expect(clampPackageCatalogPage(0, 4)).toBe(1)
  })

  it('slices the filtered list to the current page window', () => {
    const items = Array.from({ length: 13 }, (_, index) => index + 1)
    expect(slicePackageCatalogPage(items, 1)).toEqual(items.slice(0, 9))
    expect(slicePackageCatalogPage(items, 2)).toEqual([10, 11, 12, 13])
    expect(slicePackageCatalogPage(items, 99)).toEqual([10, 11, 12, 13])
  })

  it('returns a visible window only when results exceed one page', () => {
    expect(getPackageCatalogPageWindow(9, 1)).toBeNull()
    expect(getPackageCatalogPageWindow(13, 1)).toEqual({ start: 1, end: 9 })
    expect(getPackageCatalogPageWindow(13, 2)).toEqual({ start: 10, end: 13 })
  })

  it('lists every page until ellipsis is needed', () => {
    expect(getPackageCatalogPaginationItems(1, 1)).toEqual([])
    expect(getPackageCatalogPaginationItems(2, 3)).toEqual([1, 2, 3])
    expect(getPackageCatalogPaginationItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(getPackageCatalogPaginationItems(1, 10)).toEqual([1, 2, 3, 'ellipsis-end', 10])
    expect(getPackageCatalogPaginationItems(5, 10)).toEqual([
      1,
      'ellipsis-start',
      4,
      5,
      6,
      'ellipsis-end',
      10,
    ])
    expect(getPackageCatalogPaginationItems(10, 10)).toEqual([1, 'ellipsis-start', 8, 9, 10])
  })
})
