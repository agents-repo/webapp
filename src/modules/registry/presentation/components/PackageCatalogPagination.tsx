import type { MouseEvent, ReactNode } from 'react'
import { Pagination } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  applyPackageCatalogPageToSearchParams,
  getPackageCatalogPaginationItems,
} from '../../application/packageCatalogPagination'
import { publicSitePath } from '../../../site/presentation/routes/siteRoutes'

export function PackageCatalogPagination(options: {
  readonly currentPage: number
  readonly pageCount: number
  readonly pathname: string
  readonly searchParams: URLSearchParams
  readonly onNavigate: () => void
}): ReactNode {
  const { currentPage, pageCount, pathname, searchParams, onNavigate } = options
  if (pageCount <= 1) {
    return null
  }

  const pageHref = (page: number): string => {
    const query = applyPackageCatalogPageToSearchParams(searchParams, page).toString()
    return publicSitePath(query.length > 0 ? `${pathname}?${query}` : pathname)
  }

  const handleNavigate = (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
      return
    }

    onNavigate()
  }

  const previousHref = pageHref(currentPage - 1)
  const nextHref = pageHref(currentPage + 1)

  return (
    <nav aria-label="Package results pages" className="mt-4">
      <Pagination className="mb-0 justify-content-center">
        {currentPage <= 1 ? (
          <Pagination.Prev disabled />
        ) : (
          <Pagination.Item as={Link} to={previousHref} aria-label="Previous" onClick={handleNavigate}>
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">Previous</span>
          </Pagination.Item>
        )}
        {getPackageCatalogPaginationItems(currentPage, pageCount).map((item, index) => {
          if (item === 'ellipsis') {
            return <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
          }

          if (item === currentPage) {
            return (
              <Pagination.Item key={item} active aria-current="page">
                {item}
              </Pagination.Item>
            )
          }

          return (
            <Pagination.Item key={item} as={Link} to={pageHref(item)} onClick={handleNavigate}>
              {item}
            </Pagination.Item>
          )
        })}
        {currentPage >= pageCount ? (
          <Pagination.Next disabled />
        ) : (
          <Pagination.Item as={Link} to={nextHref} aria-label="Next" onClick={handleNavigate}>
            <span aria-hidden="true">›</span>
            <span className="visually-hidden">Next</span>
          </Pagination.Item>
        )}
      </Pagination>
    </nav>
  )
}
