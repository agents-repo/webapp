import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import {
  getInitialCatalogFiltersSidebarCollapsed,
  persistCatalogFiltersSidebarCollapsed,
} from '../../application/catalogFilterPreferences'
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
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogSearch } from '../components/PackageCatalogSearch'
import { useStickySearch } from '../components/useStickySearch'
import { getCatalogAlertState, getCatalogResultsSummary } from './homePageCatalogState'

const STICKY_SEARCH_THRESHOLD = 180
const QUERY_DEBOUNCE_MS = 300

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
  } = useRegistryCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = useMemo(() => parsePackageCatalogFilters(searchParams), [searchParams])
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
  const searchParamsKey = searchParams.toString()

  const filters = useMemo(
    () => ({ ...urlFilters, query: draftQuery }),
    [draftQuery, urlFilters],
  )

  useEffect(() => {
    const currentFilters = parsePackageCatalogFilters(new URLSearchParams(searchParamsKey))
    if (draftQuery.trim() === currentFilters.query.trim()) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSearchParams(
        applyPackageCatalogFiltersToSearchParams(new URLSearchParams(searchParamsKey), {
          ...currentFilters,
          query: draftQuery,
        }),
        { replace: true },
      )
    }, QUERY_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [draftQuery, searchParamsKey, setSearchParams])

  const commitFilters = useCallback(
    (nextFilters: PackageCatalogFilters, replace = false) => {
      setDraftQuery(nextFilters.query)
      setSearchParams(applyPackageCatalogFiltersToSearchParams(new URLSearchParams(searchParamsKey), nextFilters), {
        replace,
      })
    },
    [searchParamsKey, setSearchParams],
  )

  const listingPackages = useMemo(() => excludeYankedPackages(packages), [packages])

  const filteredPackages = useMemo(
    () => filterPackageCatalog(listingPackages, filters),
    [filters, listingPackages],
  )

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
      commitFilters(toggleFilterValue(filters, facet, value))
    },
    [commitFilters, filters],
  )

  const clearFilters = useCallback(() => {
    commitFilters(EMPTY_PACKAGE_CATALOG_FILTERS)
  }, [commitFilters])

  const filterByOwner = useCallback(
    (owner: string) => {
      commitFilters({ ...filters, query: `@${owner}` })
    },
    [commitFilters, filters],
  )

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current
      persistCatalogFiltersSidebarCollapsed(next)
      return next
    })
  }, [])

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
    showLoadingSpinner: isCatalogLoading && !catalog,
  }
}
