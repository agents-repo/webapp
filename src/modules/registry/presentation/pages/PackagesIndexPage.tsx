import type { ReactNode } from 'react'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogIndexLayout } from './PackageCatalogIndexLayout'

interface PackagesIndexPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function PackagesIndexPage({ setHeaderSearchSlot }: PackagesIndexPageProps) {
  const { catalog } = useRegistryCatalog()

  return (
    <PackageCatalogIndexLayout
      setHeaderSearchSlot={setHeaderSearchSlot}
      title="All packages"
      lead="A crawlable index of every published package in the registry. Search by name, owner, description, tag, or category, and narrow results with filters."
      resultsHeading={(trimmedQuery) =>
        trimmedQuery ? `Search results for "${trimmedQuery}"` : 'Published packages'
      }
      searchInputId="packages-index-search"
      searchAriaLabel="Search all packages"
      packages={catalog?.packages ?? []}
      catalog={catalog}
    />
  )
}

export default PackagesIndexPage
