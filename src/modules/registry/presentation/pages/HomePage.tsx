import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { publicSitePath } from '../../../site/presentation/routes/siteRoutes'
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
  const { catalog } = useRegistryCatalog()
  const page = useHomeHeroSearch({
    catalog,
    searchInputId: 'registry-package-search',
    setHeaderSearchSlot,
  })
  const packagesIndexPath = publicSitePath(getPackagesIndexPath())

  return (
    <>
      <HomeHeroSection searchControl={page.searchControl} stickySearch={page.stickySearch} />
      <HomeSupportedToolsSection />
      <HomeValueSection />
      <HomeHowItWorksSection />
      <HomeCliQuickstartSection />
      <HomeUseInChatSection />

      <CatalogResultsPanel
        resultsHeading="Most downloaded in the last year"
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
            View all packages
          </Link>
        }
        resultsFooter={
          <div className="d-flex justify-content-center mt-4">
            <Link to={packagesIndexPath} className="btn btn-outline-primary">
              View all packages
            </Link>
          </div>
        }
        emptyMatchMessage="No packages are available in the catalog yet."
      />

      <HomeContributeSection />
    </>
  )
}

export default HomePage
