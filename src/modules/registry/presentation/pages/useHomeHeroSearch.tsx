import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { publicSitePath } from '../../../site/presentation/routes/siteRoutes'
import { CATALOG_SEARCH_DEBOUNCE_MS } from '../../application/catalogSearch'
import { excludeYankedPackages } from '../../application/packageCatalogFilters'
import { selectHomePopularPackages } from '../../application/packageDownloadStats'
import { getPackagesIndexPath } from '../../application/packageSiteRoutes'
import type { RegistryCatalog } from '../../domain/package'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogSearch } from '../components/PackageCatalogSearch'
import { useStickySearch } from '../components/useStickySearch'
import { getCatalogAlertState, getCatalogResultsSummary } from './homePageCatalogState'

const STICKY_SEARCH_THRESHOLD = 180

function packagesSearchPath(query: string): string {
  const params = new URLSearchParams()
  params.set('q', query)
  return `${publicSitePath(getPackagesIndexPath())}?${params.toString()}`
}

export function useHomeHeroSearch(options: {
  readonly catalog: RegistryCatalog | null
  readonly searchInputId: string
  readonly searchAriaLabel?: string
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}) {
  const { catalog, searchInputId, searchAriaLabel, setHeaderSearchSlot } = options
  const navigate = useNavigate()
  const {
    cacheState: catalogCacheState,
    indexUrl: catalogSourceUrl,
    registryBaseUrl,
    errorMessage: catalogErrorMessage,
    isLoading: isCatalogLoading,
    downloadStatsById,
  } = useRegistryCatalog()
  const [query, setQuery] = useState('')
  const stickySearch = useStickySearch(STICKY_SEARCH_THRESHOLD)
  const catalogAlertState = getCatalogAlertState({
    hasCatalog: catalog !== null,
    cacheState: catalogCacheState,
    errorMessage: catalogErrorMessage,
  })
  const canShowCatalogSourceLink = isSafeExternalHttpUrl(catalogSourceUrl)
  const listingPackages = useMemo(
    () => excludeYankedPackages(catalog?.packages ?? []),
    [catalog],
  )
  const popularPackages = useMemo(
    () => selectHomePopularPackages(listingPackages, downloadStatsById),
    [downloadStatsById, listingPackages],
  )
  const catalogResultsSummary = getCatalogResultsSummary({
    catalog,
    filteredCount: popularPackages.length,
    isLoading: isCatalogLoading,
    listingCount: listingPackages.length,
  })

  const navigateToPackagesSearch = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim()
      if (!trimmed) {
        return
      }

      void navigate(packagesSearchPath(trimmed))
    },
    [navigate],
  )

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      navigateToPackagesSearch(query)
    }, CATALOG_SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [navigateToPackagesSearch, query])

  const searchControl = useMemo(
    () => (
      <PackageCatalogSearch
        query={query}
        onQueryChange={setQuery}
        onSubmit={navigateToPackagesSearch}
        inputId={searchInputId}
        ariaLabel={searchAriaLabel}
      />
    ),
    [navigateToPackagesSearch, query, searchAriaLabel, searchInputId],
  )

  useEffect(() => {
    setHeaderSearchSlot(stickySearch ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [searchControl, setHeaderSearchSlot, stickySearch])

  const filterByOwner = useCallback(
    (owner: string) => {
      void navigate(packagesSearchPath(`@${owner}`))
    },
    [navigate],
  )

  return {
    catalogAlertState,
    catalogSourceUrl,
    catalogErrorMessage,
    canShowCatalogSourceLink,
    catalogResultsSummary,
    popularPackages,
    registryBaseUrl,
    searchControl,
    stickySearch,
    filterByOwner,
    showLoadingSpinner: isCatalogLoading && !catalog,
  }
}
