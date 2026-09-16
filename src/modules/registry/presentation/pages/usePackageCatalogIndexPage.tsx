import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { whenMainRouteContentReady } from '../../../site/application/accessibility/routeContentReady'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import {
  completePackageCatalogSearchFocusHandoff,
  hasActivePackageCatalogSearchFocusHandoff,
  shouldFocusPackageCatalogSearch,
} from '../../application/catalogSearchNavigation'
import {
  getInitialCatalogFiltersSidebarCollapsed,
  persistCatalogFiltersSidebarCollapsed,
} from '../../application/catalogFilterPreferences'
import { buildPackageSearchMatchContextMap, CATALOG_SEARCH_DEBOUNCE_MS } from '../../application/catalogSearch'
import {
  parsePackageCatalogCollection,
  restrictPackagesToCollection,
} from '../../application/startHereCollection'
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
  getPackageCatalogPageSize,
  getPackageCatalogPageWindow,
  parsePackageCatalogPage,
  slicePackageCatalogPage,
} from '../../application/packageCatalogPagination'
import type { DownloadStatsPeriod } from '../../domain/downloadStats'
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogSearch } from '../components/PackageCatalogSearch'
import { useStickySearch } from '../components/useStickySearch'
import { getCatalogAlertState, getCatalogResultsSummary } from './homePageCatalogState'

export const PACKAGE_CATALOG_STICKY_SEARCH_THRESHOLD = 180

const PACKAGE_CATALOG_LG_VIEWPORT_QUERY = '(min-width: 992px)'

function subscribeToPackageCatalogLgViewport(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(PACKAGE_CATALOG_LG_VIEWPORT_QUERY)
  mediaQuery.addEventListener('change', onStoreChange)
  return () => {
    mediaQuery.removeEventListener('change', onStoreChange)
  }
}

function getPackageCatalogLgViewportSnapshot(): boolean {
  return window.matchMedia(PACKAGE_CATALOG_LG_VIEWPORT_QUERY).matches
}

function focusVisiblePackageCatalogSearchInput(searchInputId: string): void {
  const searchInputs = document.querySelectorAll<HTMLInputElement>(
    `input#${CSS.escape(searchInputId)}`,
  )
  if (searchInputs.length === 0) {
    return
  }

  const visibleInput =
    searchInputs.length === 1
      ? searchInputs[0]
      : Array.from(searchInputs).find((input) => input.offsetParent !== null)

  if (!visibleInput) {
    return
  }

  visibleInput.focus({ preventScroll: true })
  const caretIndex = visibleInput.value.length
  visibleInput.setSelectionRange(caretIndex, caretIndex)
}

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
  readonly enableCollection?: boolean
}) {
  const {
    catalog,
    packages,
    searchInputId,
    searchAriaLabel,
    setHeaderSearchSlot,
    enableCollection = false,
  } = options
  const {
    cacheState: catalogCacheState,
    indexUrl: catalogSourceUrl,
    registryBaseUrl,
    errorMessage: catalogErrorMessage,
    isLoading: isCatalogLoading,
    downloadStatsById,
  } = useRegistryCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const locationRef = useRef(location)
  useLayoutEffect(() => {
    locationRef.current = location
  }, [location])
  const { pathname } = location

  const getReplaceSearchParamsOptions = useCallback(() => {
    const currentLocation = locationRef.current
    const options: { replace: true; state?: unknown } = { replace: true }
    if (
      shouldFocusPackageCatalogSearch(currentLocation.state) ||
      hasActivePackageCatalogSearchFocusHandoff()
    ) {
      options.state = currentLocation.state
    }

    return options
  }, [])
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
  const stickySearch = useStickySearch(PACKAGE_CATALOG_STICKY_SEARCH_THRESHOLD)
  const isLgViewport = useSyncExternalStore(
    subscribeToPackageCatalogLgViewport,
    getPackageCatalogLgViewportSnapshot,
    () => false,
  )
  const showHeroSearch = !stickySearch || !isLgViewport
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
        getReplaceSearchParamsOptions(),
      )
    }, CATALOG_SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [draftQuery, getReplaceSearchParamsOptions, setSearchParams, urlFilters.query])

  const commitFilters = useCallback(
    (nextFilters: PackageCatalogFilters, replace = false) => {
      filtersRef.current = nextFilters
      setDraftQuery(nextFilters.query)
      setSearchParams(
        (previousParams) => applyPackageCatalogFiltersToSearchParams(previousParams, nextFilters),
        replace ? getReplaceSearchParamsOptions() : { replace },
      )
    },
    [getReplaceSearchParamsOptions, setSearchParams],
  )

  const activeCollection = useMemo(
    () => (enableCollection ? parsePackageCatalogCollection(searchParams) : null),
    [enableCollection, searchParams],
  )

  const listingPackages = useMemo(() => {
    const visiblePackages = excludeYankedPackages(packages)
    return restrictPackagesToCollection(visiblePackages, activeCollection)
  }, [activeCollection, packages])

  const filteredPackages = useMemo(
    () =>
      sortPackagesByDownloadPeriod(
        filterPackageCatalog(listingPackages, filters),
        downloadStatsById,
        downloadPeriod,
      ),
    [downloadPeriod, downloadStatsById, filters, listingPackages],
  )
  const sidebarVisibleForPageSize = isLgViewport && !sidebarCollapsed
  const catalogPageSize = getPackageCatalogPageSize(sidebarVisibleForPageSize)
  const catalogPageCount = getPackageCatalogPageCount(filteredPackages.length, catalogPageSize)
  const catalogPage = clampPackageCatalogPage(requestedPage, catalogPageCount)
  const pagedPackages = useMemo(
    () => slicePackageCatalogPage(filteredPackages, catalogPage, catalogPageSize),
    [catalogPage, catalogPageSize, filteredPackages],
  )
  const searchMatchContextById = useMemo(
    () => buildPackageSearchMatchContextMap(pagedPackages, filters.query),
    [filters.query, pagedPackages],
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

    setSearchParams(nextParams, getReplaceSearchParamsOptions())
  }, [catalog, catalogPage, getReplaceSearchParamsOptions, searchParams, setSearchParams])

  const previousCatalogPageSizeRef = useRef(catalogPageSize)
  useEffect(() => {
    if (!catalog) {
      return
    }

    if (previousCatalogPageSizeRef.current === catalogPageSize) {
      return
    }

    previousCatalogPageSizeRef.current = catalogPageSize
    const nextPageCount = getPackageCatalogPageCount(filteredPackages.length, catalogPageSize)
    const nextPage = clampPackageCatalogPage(requestedPage, nextPageCount)
    const nextParams = applyPackageCatalogPageToSearchParams(searchParams, nextPage)
    if (nextParams.toString() === searchParams.toString()) {
      return
    }

    setSearchParams(nextParams, getReplaceSearchParamsOptions())
  }, [
    catalog,
    catalogPageSize,
    filteredPackages.length,
    getReplaceSearchParamsOptions,
    requestedPage,
    searchParams,
    setSearchParams,
  ])

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
    pageWindow: getPackageCatalogPageWindow(filteredPackages.length, catalogPage, catalogPageSize),
  })

  const searchControl = useMemo(
    () => (
      <PackageCatalogSearch
        key={searchInputId}
        query={draftQuery}
        onQueryChange={setDraftQuery}
        inputId={searchInputId}
        ariaLabel={searchAriaLabel}
      />
    ),
    [draftQuery, searchAriaLabel, searchInputId],
  )

  useLayoutEffect(() => {
    setHeaderSearchSlot(stickySearch && isLgViewport ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [isLgViewport, searchControl, setHeaderSearchSlot, stickySearch])

  const previousStickySearchRef = useRef(stickySearch)
  useLayoutEffect(() => {
    const stickyChanged = previousStickySearchRef.current !== stickySearch
    previousStickySearchRef.current = stickySearch
    if (!stickyChanged) {
      return
    }

    const activeElement = document.activeElement
    if (!(activeElement instanceof HTMLInputElement) || activeElement.id !== searchInputId) {
      return
    }

    window.requestAnimationFrame(() => {
      focusVisiblePackageCatalogSearchInput(searchInputId)
    })
  }, [searchInputId, stickySearch])

  const catalogSearchFocusHandoffKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!shouldFocusPackageCatalogSearch(location.state)) {
      return
    }

    if (catalogSearchFocusHandoffKeyRef.current === location.key) {
      return
    }

    let cancelled = false
    let frameId = 0
    let attempts = 0
    const maxAttempts = 24

    const clearNavigationState = (): void => {
      const currentLocation = locationRef.current
      if (!shouldFocusPackageCatalogSearch(currentLocation.state)) {
        return
      }

      void navigate(
        {
          pathname: currentLocation.pathname,
          search: currentLocation.search,
        },
        { replace: true, state: null },
      )
    }

    const tryFocusSearch = (): void => {
      if (cancelled) {
        return
      }

      attempts += 1
      focusVisiblePackageCatalogSearchInput(searchInputId)
      if (document.activeElement?.id === searchInputId) {
        catalogSearchFocusHandoffKeyRef.current = locationRef.current.key
        clearNavigationState()
        return
      }

      if (attempts < maxAttempts) {
        frameId = window.requestAnimationFrame(tryFocusSearch)
        return
      }

      catalogSearchFocusHandoffKeyRef.current = locationRef.current.key
      completePackageCatalogSearchFocusHandoff()
      clearNavigationState()

      const mainContent = document.getElementById('main-content')
      const skipLinkWasUsed = document.activeElement?.classList.contains('skip-link')
      if (!skipLinkWasUsed && mainContent) {
        mainContent.focus({ preventScroll: true })
      }
    }

    const startFocusHandoff = (): void => {
      frameId = window.requestAnimationFrame(tryFocusSearch)
    }

    const stopWaitingForContent = whenMainRouteContentReady(startFocusHandoff)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frameId)
      stopWaitingForContent()
    }
  }, [location.key, location.pathname, location.state, navigate, searchInputId])

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
        getReplaceSearchParamsOptions(),
      )
    },
    [getReplaceSearchParamsOptions, setSearchParams],
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
    showCatalogPagination: filteredPackages.length > catalogPageSize,
    onCatalogPageNavigate: () => {
      shouldFocusResultsSummaryRef.current = true
    },
    facets,
    filters,
    popularChips,
    registryBaseUrl,
    searchControl,
    showHeroSearch,
    stickySearch,
    trimmedQuery: draftQuery.trim(),
    activeCollection,
    searchMatchContextById,
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
