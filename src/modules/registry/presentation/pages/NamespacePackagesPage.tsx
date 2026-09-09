import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { isPackagePathSegment, namespaceExistsInCatalog } from '../../application/packageSiteRoutes'
import { shouldAwaitCatalogMembershipRecheck } from '../../application/runtimePackageCatalog'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { useCatalogMembershipRecheck } from '../catalog/useCatalogMembershipRecheck'
import { PackageCatalogIndexLayout } from './PackageCatalogIndexLayout'
import PackageSiteNotFound from './PackageSiteNotFound'

interface NamespacePackagesPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function NamespacePackagesPage({ setHeaderSearchSlot }: NamespacePackagesPageProps) {
  const { t } = useTranslation('catalog')
  const { namespace } = useParams()
  const { catalog, isLoading, hasCompletedForcedReload } = useRegistryCatalog()
  const namespaceValue = namespace ?? ''
  const isValidNamespacePath = isPackagePathSegment(namespaceValue)
  const namespaceKnown = catalog ? namespaceExistsInCatalog(catalog, namespaceValue) : false
  const awaitingMembershipRecheck =
    isValidNamespacePath &&
    shouldAwaitCatalogMembershipRecheck({
      catalog,
      isLoading,
      hasCompletedForcedReload,
      isMember: namespaceKnown,
    })

  useCatalogMembershipRecheck({
    enabled: isValidNamespacePath,
    isMember: namespaceKnown,
  })

  useEffect(() => {
    if (!namespaceKnown && catalog && !awaitingMembershipRecheck) {
      setHeaderSearchSlot(null)
    }
  }, [awaitingMembershipRecheck, catalog, namespaceKnown, setHeaderSearchSlot])

  if (!isValidNamespacePath) {
    return <PackageSiteNotFound />
  }

  const layoutProps = {
    setHeaderSearchSlot,
    title: t('namespacePackages.title', { namespace: namespaceValue }),
    lead: t('namespacePackages.lead', { namespace: namespaceValue }),
    resultsHeading: (trimmedQuery: string) =>
      trimmedQuery
        ? t('namespacePackages.searchResults', { query: trimmedQuery })
        : t('namespacePackages.publishedPackages', { namespace: namespaceValue }),
    searchInputId: `namespace-packages-search-${namespaceValue}`,
    searchAriaLabel: t('namespacePackages.searchAriaLabel', { namespace: namespaceValue }),
  }

  if (awaitingMembershipRecheck) {
    return <PackageCatalogIndexLayout {...layoutProps} packages={[]} catalog={null} />
  }

  if (!namespaceKnown) {
    return <PackageSiteNotFound />
  }

  const packages = catalog?.packages.filter((pkg) => pkg.namespace === namespaceValue) ?? []

  return <PackageCatalogIndexLayout {...layoutProps} packages={packages} catalog={catalog} />
}

export default NamespacePackagesPage
