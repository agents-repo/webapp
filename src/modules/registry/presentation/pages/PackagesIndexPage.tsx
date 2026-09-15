import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  isStartHereCollection,
  parsePackageCatalogCollection,
} from '../../application/startHereCollection'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageCatalogIndexLayout } from './PackageCatalogIndexLayout'

interface PackagesIndexPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function PackagesIndexPage({ setHeaderSearchSlot }: PackagesIndexPageProps) {
  const { t } = useTranslation('catalog')
  const { catalog } = useRegistryCatalog()
  const [searchParams] = useSearchParams()
  const activeCollection = parsePackageCatalogCollection(searchParams)
  const isStartHere = isStartHereCollection(activeCollection)

  const getResultsHeading = (trimmedQuery: string): string => {
    if (trimmedQuery) {
      return t('packagesIndex.searchResults', { query: trimmedQuery })
    }

    if (isStartHere) {
      return t('packagesIndex.startHere.resultsHeading')
    }

    return t('packagesIndex.publishedPackages')
  }

  return (
    <PackageCatalogIndexLayout
      setHeaderSearchSlot={setHeaderSearchSlot}
      title={isStartHere ? t('packagesIndex.startHere.title') : t('packagesIndex.title')}
      lead={isStartHere ? t('packagesIndex.startHere.lead') : t('packagesIndex.lead')}
      resultsHeading={getResultsHeading}
      searchInputId="packages-index-search"
      searchAriaLabel={t('packagesIndex.searchAriaLabel')}
      packages={catalog?.packages ?? []}
      catalog={catalog}
      enableCollection
    />
  )
}

export default PackagesIndexPage
