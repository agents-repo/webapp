import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { filterRegistryPackages } from '../../application/registrySelectors'
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogSearch } from '../components/PackageCatalogSearch'
import { useStickySearch } from '../components/useStickySearch'
import { getCatalogAlertState, getCatalogResultsSummary } from './homePageCatalogState'

const STICKY_SEARCH_THRESHOLD = 180

export function useCatalogIndexPage(options: {
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
  const [query, setQuery] = useState('')
  const stickySearch = useStickySearch(STICKY_SEARCH_THRESHOLD)
  const trimmedQuery = query.trim()
  const catalogAlertState = getCatalogAlertState({
    hasCatalog: catalog !== null,
    cacheState: catalogCacheState,
    errorMessage: catalogErrorMessage,
  })
  const canShowCatalogSourceLink = isSafeExternalHttpUrl(catalogSourceUrl)

  const scopedCatalog = useMemo<RegistryCatalog | null>(() => {
    if (!catalog) {
      return null
    }

    return { ...catalog, packages: [...packages] }
  }, [catalog, packages])

  const filteredPackages = useMemo(() => {
    if (!scopedCatalog) {
      return []
    }

    return filterRegistryPackages(scopedCatalog, query)
  }, [query, scopedCatalog])

  const catalogResultsSummary = getCatalogResultsSummary({
    catalog: scopedCatalog,
    filteredCount: filteredPackages.length,
    isLoading: isCatalogLoading,
  })

  const searchControl = useMemo(
    () => (
      <PackageCatalogSearch
        query={query}
        onQueryChange={setQuery}
        inputId={searchInputId}
        ariaLabel={searchAriaLabel}
      />
    ),
    [query, searchAriaLabel, searchInputId],
  )

  useEffect(() => {
    setHeaderSearchSlot(stickySearch ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [searchControl, setHeaderSearchSlot, stickySearch])

  return {
    catalogAlertState,
    catalogSourceUrl,
    catalogErrorMessage,
    canShowCatalogSourceLink,
    catalogResultsSummary,
    filteredPackages,
    registryBaseUrl,
    searchControl,
    stickySearch,
    trimmedQuery,
    setQuery,
    showLoadingSpinner: isCatalogLoading && !catalog,
  }
}
