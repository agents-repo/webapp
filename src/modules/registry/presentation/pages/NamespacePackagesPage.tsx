import { useEffect, type ReactNode } from 'react'
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
    title: `${namespaceValue} packages`,
    lead: `Published packages in the ${namespaceValue} namespace. Search is limited to this namespace.`,
    resultsHeading: (trimmedQuery: string) =>
      trimmedQuery ? `Search results for "${trimmedQuery}"` : `${namespaceValue} packages`,
    searchInputId: `namespace-packages-search-${namespaceValue}`,
    searchAriaLabel: `Search packages in ${namespaceValue}`,
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
