import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogIndexLayout } from './PackageCatalogIndexLayout'

interface PackagesIndexPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function PackagesIndexPage({ setHeaderSearchSlot }: PackagesIndexPageProps) {
  const { t } = useTranslation('catalog')
  const { catalog } = useRegistryCatalog()

  return (
    <PackageCatalogIndexLayout
      setHeaderSearchSlot={setHeaderSearchSlot}
      title={t('packagesIndex.title')}
      lead={t('packagesIndex.lead')}
      resultsHeading={(trimmedQuery) =>
        trimmedQuery
          ? t('packagesIndex.searchResults', { query: trimmedQuery })
          : t('packagesIndex.publishedPackages')
      }
      searchInputId="packages-index-search"
      searchAriaLabel={t('packagesIndex.searchAriaLabel')}
      packages={catalog?.packages ?? []}
      catalog={catalog}
    />
  )
}

export default PackagesIndexPage
