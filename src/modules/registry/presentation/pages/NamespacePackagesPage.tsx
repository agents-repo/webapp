import { useEffect, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { namespaceExistsInCatalog } from '../../application/packageSiteRoutes'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { useCatalogMembershipRecheck } from '../catalog/useCatalogMembershipRecheck'
import { PackageCatalogIndexLayout } from './PackageCatalogIndexLayout'
import PackageSiteNotFound from './PackageSiteNotFound'

interface NamespacePackagesPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function NamespacePackagesPage({ setHeaderSearchSlot }: NamespacePackagesPageProps) {
  const { namespace } = useParams()
  const { catalog, isLoading } = useRegistryCatalog()
  const namespaceValue = namespace ?? ''
  const namespaceKnown = catalog ? namespaceExistsInCatalog(catalog, namespaceValue) : false

  useCatalogMembershipRecheck({
    enabled: Boolean(namespaceValue),
    isMember: namespaceKnown,
  })

  useEffect(() => {
    if (!namespaceKnown && catalog && !isLoading) {
      setHeaderSearchSlot(null)
    }
  }, [catalog, isLoading, namespaceKnown, setHeaderSearchSlot])

  if (!namespaceValue) {
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

  if (isLoading && !namespaceKnown) {
    return <PackageCatalogIndexLayout {...layoutProps} packages={[]} catalog={null} />
  }

  if (!namespaceKnown) {
    return <PackageSiteNotFound />
  }

  const packages = catalog?.packages.filter((pkg) => pkg.namespace === namespaceValue) ?? []

  return <PackageCatalogIndexLayout {...layoutProps} packages={packages} catalog={catalog} />
}

export default NamespacePackagesPage
