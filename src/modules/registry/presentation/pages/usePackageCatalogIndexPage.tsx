import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import {
  getInitialCatalogFiltersSidebarCollapsed,
  persistCatalogFiltersSidebarCollapsed,
} from '../../application/catalogFilterPreferences'
import { CATALOG_SEARCH_DEBOUNCE_MS } from '../../application/catalogSearch'
import {
  applyPackageCatalogFiltersToSearchParams,
  collectPackageCatalogFacets,
  countSelectedPackageCatalogFacets,
  EMPTY_PACKAGE_CATALOG_FILTERS,
  excludeYankedPackages,
  filterPackageCatalog,
  getPopularPackageCatalogChips,
  packageCatalogFilterIncludes,
  parsePackageCatalogFilters,
  togglePackageCatalogFilterValue,
  type PackageCatalogFilterFacet,
  type PackageCatalogFilters,
} from '../../application/packageCatalogFilters'
import {
  applyDownloadStatsPeriodToSearchParams,
  parseDownloadStatsPeriod,
  sortPackagesByDownloadPeriod,
} from '../../application/packageDownloadStats'
import {
  applyPackageCatalogPageToSearchParams,
  clampPackageCatalogPage,
  getPackageCatalogPageCount,
  getPackageCatalogPageWindow,
  PACKAGE_CATALOG_PAGE_SIZE,
  parsePackageCatalogPage,
  slicePackageCatalogPage,
} from '../../application/packageCatalogPagination'
import type { DownloadStatsPeriod } from '../../domain/downloadStats'
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogSearch } from '../components/PackageCatalogSearch'
import { useStickySearch } from '../components/useStickySearch'
import { getCatalogAlertState, getCatalogResultsSummary } from './homePageCatalogState'

const STICKY_SEARCH_THRESHOLD = 180

function toggleFilterValue(
  filters: PackageCatalogFilters,
  facet: PackageCatalogFilterFacet,
  value: string,
): PackageCatalogFilters {
  switch (facet) {
    case 'category':
      return { ...filters, categories: togglePackageCatalogFilterValue(filters.categories, value) }
    case 'tag':
      return { ...filters, tags: togglePackageCatalogFilterValue(filters.tags, value) }
    case 'target':
      return { ...filters, targets: togglePackageCatalogFilterValue(filters.targets, value) }
    case 'status':
      return { ...filters, statuses: togglePackageCatalogFilterValue(filters.statuses, value) }
    case 'cost':
      return { ...filters, costBands: togglePackageCatalogFilterValue(filters.costBands, value) }
    case 'chatWeb':
      return { ...filters, chatWebOnly: !filters.chatWebOnly }
  }
}

export function usePackageCatalogIndexPage(options: {
  readonly catalog: RegistryCatalog | null
  readonly packages: readonly RegistryPackage[]
  readonly searchInputId: string
  readonly searchAriaLabel?: string
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}) {
  const { catalog, packages, searchInputId, searchAriaLabel, setHeaderSearchSlot } = options
  const {
    cacheState: catalogCacheState,
    indexUrl: catalogSourceUrl,
    registryBaseUrl,
    errorMessage: catalogErrorMessage,
    isLoading: isCatalogLoading,
    downloadStatsById,
  } = useRegistryCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const { pathname } = useLocation()
  const urlFilters = useMemo(() => parsePackageCatalogFilters(searchParams), [searchParams])
  const downloadPeriod = useMemo(() => parseDownloadStatsPeriod(searchParams), [searchParams])
  const requestedPage = useMemo(() => parsePackageCatalogPage(searchParams), [searchParams])
  const [draftQuery, setDraftQuery] = useState(urlFilters.query)
  const [previousUrlQuery, setPreviousUrlQuery] = useState(urlFilters.query)
  if (urlFilters.query !== previousUrlQuery) {
    setPreviousUrlQuery(urlFilters.query)
    setDraftQuery(urlFilters.query)
  }
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialCatalogFiltersSidebarCollapsed)
  const [filtersOffcanvasOpen, setFiltersOffcanvasOpen] = useState(false)
  const stickySearch = useStickySearch(STICKY_SEARCH_THRESHOLD)
  const catalogAlertState = getCatalogAlertState({
    hasCatalog: catalog !== null,
    cacheState: catalogCacheState,
    errorMessage: catalogErrorMessage,
  })
  const canShowCatalogSourceLink = isSafeExternalHttpUrl(catalogSourceUrl)

  const filters = useMemo(
    () => ({ ...urlFilters, query: draftQuery }),
    [draftQuery, urlFilters],
  )
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    if (draftQuery.trim() === urlFilters.query.trim()) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSearchParams(
        (previousParams) => {
          const currentFilters = parsePackageCatalogFilters(previousParams)
          if (draftQuery.trim() === currentFilters.query.trim()) {
            return previousParams
          }

          return applyPackageCatalogFiltersToSearchParams(previousParams, {
            ...currentFilters,
            query: draftQuery,
          })
        },
        { replace: true },
      )
    }, CATALOG_SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [draftQuery, setSearchParams, urlFilters.query])

  const commitFilters = useCallback(
    (nextFilters: PackageCatalogFilters, replace = false) => {
      filtersRef.current = nextFilters
      setDraftQuery(nextFilters.query)
      setSearchParams(
        (previousParams) => applyPackageCatalogFiltersToSearchParams(previousParams, nextFilters),
        { replace },
      )
    },
    [setSearchParams],
  )

  const listingPackages = useMemo(() => excludeYankedPackages(packages), [packages])

  const filteredPackages = useMemo(
    () =>
      sortPackagesByDownloadPeriod(
        filterPackageCatalog(listingPackages, filters),
        downloadStatsById,
        downloadPeriod,
      ),
    [downloadPeriod, downloadStatsById, filters, listingPackages],
  )
  const catalogPageCount = getPackageCatalogPageCount(filteredPackages.length)
  const catalogPage = clampPackageCatalogPage(requestedPage, catalogPageCount)
  const pagedPackages = useMemo(
    () => slicePackageCatalogPage(filteredPackages, catalogPage),
    [catalogPage, filteredPackages],
  )
  const shouldFocusResultsSummaryRef = useRef(false)

  useEffect(() => {
    if (!catalog) {
      return
    }

    const nextParams = applyPackageCatalogPageToSearchParams(searchParams, catalogPage)
    if (nextParams.toString() === searchParams.toString()) {
      return
    }

    setSearchParams(nextParams, { replace: true })
  }, [catalog, catalogPage, searchParams, setSearchParams])

  useEffect(() => {
    if (!shouldFocusResultsSummaryRef.current) {
      return
    }

    shouldFocusResultsSummaryRef.current = false
    const summary = document.getElementById('catalog-results-summary')
    if (summary && typeof summary.scrollIntoView === 'function') {
      summary.scrollIntoView({ block: 'start' })
    }
    summary?.focus()
  }, [catalogPage])

  const facets = useMemo(
    () => collectPackageCatalogFacets(listingPackages, filters),
    [filters, listingPackages],
  )

  const popularChips = useMemo(
    () => getPopularPackageCatalogChips(listingPackages),
    [listingPackages],
  )

  const scopedCatalog = useMemo<RegistryCatalog | null>(() => {
    if (!catalog) {
      return null
    }

    return { ...catalog, packages: [...packages] }
  }, [catalog, packages])

  const catalogResultsSummary = getCatalogResultsSummary({
    catalog: scopedCatalog,
    filteredCount: filteredPackages.length,
    isLoading: isCatalogLoading,
    listingCount: listingPackages.length,
    pageWindow: getPackageCatalogPageWindow(filteredPackages.length, catalogPage),
  })

  const searchControl = useMemo(
    () => (
      <PackageCatalogSearch
        query={draftQuery}
        onQueryChange={setDraftQuery}
        inputId={searchInputId}
        ariaLabel={searchAriaLabel}
      />
    ),
    [draftQuery, searchAriaLabel, searchInputId],
  )

  useEffect(() => {
    setHeaderSearchSlot(stickySearch ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [searchControl, setHeaderSearchSlot, stickySearch])

  const toggleFilter = useCallback(
    (facet: PackageCatalogFilterFacet, value = '') => {
      commitFilters(toggleFilterValue(filtersRef.current, facet, value))
    },
    [commitFilters],
  )

  const clearFilters = useCallback(() => {
    commitFilters(EMPTY_PACKAGE_CATALOG_FILTERS)
  }, [commitFilters])

  const filterByOwner = useCallback(
    (owner: string) => {
      commitFilters({ ...filtersRef.current, query: `@${owner}` })
    },
    [commitFilters],
  )

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current
      persistCatalogFiltersSidebarCollapsed(next)
      return next
    })
  }, [])

  const setDownloadPeriod = useCallback(
    (period: DownloadStatsPeriod) => {
      setSearchParams(
        (previousParams) => applyDownloadStatsPeriodToSearchParams(previousParams, period),
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const isFacetSelected = useCallback(
    (facet: 'category' | 'tag', value: string) => {
      if (facet === 'category') {
        return packageCatalogFilterIncludes(filters.categories, value)
      }

      return packageCatalogFilterIncludes(filters.tags, value)
    },
    [filters.categories, filters.tags],
  )

  return {
    catalogAlertState,
    catalogSourceUrl,
    catalogErrorMessage,
    canShowCatalogSourceLink,
    catalogResultsSummary,
    filteredPackages,
    pagedPackages,
    catalogPage,
    catalogPageCount,
    catalogPathname: pathname,
    searchParams,
    showCatalogPagination: filteredPackages.length > PACKAGE_CATALOG_PAGE_SIZE,
    onCatalogPageNavigate: () => {
      shouldFocusResultsSummaryRef.current = true
    },
    facets,
    filters,
    popularChips,
    registryBaseUrl,
    searchControl,
    stickySearch,
    trimmedQuery: draftQuery.trim(),
    selectedFacetCount: countSelectedPackageCatalogFacets(filters),
    sidebarCollapsed,
    filtersOffcanvasOpen,
    setFiltersOffcanvasOpen,
    toggleSidebarCollapsed,
    toggleFilter,
    clearFilters,
    filterByOwner,
    isFacetSelected,
    downloadPeriod,
    setDownloadPeriod,
    showLoadingSpinner: isCatalogLoading && !catalog,
  }
}
