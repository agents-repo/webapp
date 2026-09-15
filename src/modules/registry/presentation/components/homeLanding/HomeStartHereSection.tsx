import { useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isSafeExternalHttpUrl } from '../../../../site/application/urlSafety'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import { excludeYankedPackages } from '../../../application/packageCatalogFilters'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'
import {
  START_HERE_COLLECTION_ID,
  selectStartHerePackages,
} from '../../../application/startHereCollection'
import { useRegistryCatalog } from '../../catalog/registryCatalogContext'
import { CatalogResultsPanel } from '../PackageCatalogResults'
import { getCatalogAlertState, getCatalogResultsSummary } from '../../pages/homePageCatalogState'

function HomeStartHereSection() {
  const { t } = useTranslation('catalog')
  const navigate = useNavigate()
  const localizedSitePath = useLocalizedSitePath()
  const {
    catalog,
    cacheState: catalogCacheState,
    indexUrl: catalogSourceUrl,
    registryBaseUrl,
    errorMessage: catalogErrorMessage,
    isLoading: isCatalogLoading,
  } = useRegistryCatalog()
  const startHerePackages = useMemo(
    () => selectStartHerePackages(excludeYankedPackages(catalog?.packages ?? [])),
    [catalog],
  )
  const catalogAlertState = getCatalogAlertState({
    hasCatalog: catalog !== null,
    cacheState: catalogCacheState,
    errorMessage: catalogErrorMessage,
  })
  const catalogResultsSummary = getCatalogResultsSummary({
    catalog,
    filteredCount: startHerePackages.length,
    isLoading: isCatalogLoading,
    listingCount: startHerePackages.length,
  })
  const startHereCollectionPath = localizedSitePath(
    `${getPackagesIndexPath()}?collection=${START_HERE_COLLECTION_ID}`,
  )
  const filterByOwner = useCallback(
    (owner: string) => {
      const params = new URLSearchParams()
      params.set('q', `@${owner}`)
      void navigate(`${localizedSitePath(getPackagesIndexPath())}?${params.toString()}`)
    },
    [localizedSitePath, navigate],
  )

  if (startHerePackages.length === 0) {
    return null
  }

  return (
    <CatalogResultsPanel
      resultsHeading={t('homeLanding.startHere.heading')}
      catalogResultsSummary={catalogResultsSummary}
      catalogAlertState={catalogAlertState}
      catalogSourceUrl={catalogSourceUrl}
      canShowCatalogSourceLink={isSafeExternalHttpUrl(catalogSourceUrl)}
      catalogErrorMessage={catalogErrorMessage}
      showLoadingSpinner={isCatalogLoading && !catalog}
      filteredPackages={startHerePackages}
      hasCatalog={catalog !== null}
      registryBaseUrl={registryBaseUrl}
      onFilterByOwner={filterByOwner}
      resultsActions={
        <Link to={startHereCollectionPath} className="btn btn-outline-primary btn-sm">
          {t('homeLanding.startHere.viewAllButton')}
        </Link>
      }
      emptyMatchMessage={t('homeLanding.startHere.empty')}
    />
  )
}

export default HomeStartHereSection
