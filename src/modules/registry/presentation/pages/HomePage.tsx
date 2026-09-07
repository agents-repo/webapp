import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedSitePath } from '../../../site/application/i18n/useLocalizedSitePath.ts'
import { getPackagesIndexPath } from '../../application/packageSiteRoutes'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { CatalogResultsPanel } from '../components/PackageCatalogResults'
import HomeCliQuickstartSection from '../components/homeLanding/HomeCliQuickstartSection'
import HomeContributeSection from '../components/homeLanding/HomeContributeSection'
import HomeHeroSection from '../components/homeLanding/HomeHeroSection'
import HomeHowItWorksSection from '../components/homeLanding/HomeHowItWorksSection'
import HomeSupportedToolsSection from '../components/homeLanding/HomeSupportedToolsSection'
import HomeUseInChatSection from '../components/homeLanding/HomeUseInChatSection'
import HomeValueSection from '../components/homeLanding/HomeValueSection'
import { useHomeHeroSearch } from './useHomeHeroSearch'

interface HomePageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function HomePage({ setHeaderSearchSlot }: HomePageProps) {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const { catalog } = useRegistryCatalog()
  const page = useHomeHeroSearch({
    catalog,
    searchInputId: 'registry-package-search',
    setHeaderSearchSlot,
  })
  const packagesIndexPath = localizedSitePath(getPackagesIndexPath())

  return (
    <>
      <HomeHeroSection searchControl={page.searchControl} stickySearch={page.stickySearch} />
      <HomeSupportedToolsSection />
      <HomeValueSection />
      <HomeHowItWorksSection />
      <HomeCliQuickstartSection />
      <HomeUseInChatSection />

      <CatalogResultsPanel
        resultsHeading={t('home.popularHeading')}
        catalogResultsSummary={page.catalogResultsSummary}
        catalogAlertState={page.catalogAlertState}
        catalogSourceUrl={page.catalogSourceUrl}
        canShowCatalogSourceLink={page.canShowCatalogSourceLink}
        catalogErrorMessage={page.catalogErrorMessage}
        showLoadingSpinner={page.showLoadingSpinner}
        filteredPackages={page.popularPackages}
        hasCatalog={catalog !== null}
        registryBaseUrl={page.registryBaseUrl}
        onFilterByOwner={page.filterByOwner}
        resultsActions={
          <Link to={packagesIndexPath} className="btn btn-outline-primary btn-sm">
            {t('home.viewAllPackages')}
          </Link>
        }
        resultsFooter={
          <div className="d-flex justify-content-center mt-4">
            <Link to={packagesIndexPath} className="btn btn-outline-primary">
              {t('home.viewAllPackages')}
            </Link>
          </div>
        }
        emptyMatchMessage={t('home.emptyCatalog')}
      />

      <HomeContributeSection />
    </>
  )
}

export default HomePage
