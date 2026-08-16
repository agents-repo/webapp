import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Alert, Card, Row } from 'react-bootstrap'
import { externalLinkAccessibleName } from '../../../site/application/accessibility/externalLink'
import { toPackageSlug, type RegistryPackage } from '../../domain/package'
import { getCatalogAlertState } from '../pages/homePageCatalogState'
import { faDuotoneSpinner } from '../pages/catalogLoadingSpinnerIcon'
import { PackageCard } from './PackageCard'

export function CatalogAlert(options: {
  readonly alertState: NonNullable<ReturnType<typeof getCatalogAlertState>>
  readonly catalogSourceUrl: string
  readonly canShowCatalogSourceLink: boolean
  readonly catalogErrorMessage: string | null
}): ReactNode {
  const { alertState, catalogSourceUrl, canShowCatalogSourceLink, catalogErrorMessage } = options

  return (
    <Alert variant={alertState.variant} className="mb-3">
      {alertState.message}
      {canShowCatalogSourceLink ? (
        <>
          {' '}
          <a
            href={catalogSourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={externalLinkAccessibleName('Check configured index URL')}
          >
            Check configured index URL
          </a>
          .
        </>
      ) : null}
      {catalogErrorMessage ? <span className="small"> Details are available in the browser console.</span> : null}
    </Alert>
  )
}

export function CatalogLoadingSpinner(): ReactNode {
  return (
    <section
      className="py-5 d-flex justify-content-center"
      aria-busy="true"
      aria-labelledby="catalog-results-summary"
    >
      <FontAwesomeIcon
        icon={faDuotoneSpinner}
        spinPulse
        size="3x"
        className="text-body-secondary catalog-loading-spinner"
        aria-hidden="true"
      />
    </section>
  )
}

export function EmptyCatalogState({ hasCatalog }: { readonly hasCatalog: boolean }): ReactNode {
  return (
    <Card className="mt-4 border-secondary-subtle">
      <Card.Body className="text-center py-4">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" aria-hidden="true" />
        {hasCatalog ? 'No packages match your current search.' : 'No catalog data available.'}
      </Card.Body>
    </Card>
  )
}

export function PackageCatalogGrid(options: {
  readonly packages: readonly RegistryPackage[]
  readonly registryBaseUrl: string
  readonly onFilterByOwner: (owner: string) => void
}): ReactNode {
  return (
    <Row xs={1} md={2} xl={3} className="g-3">
      {options.packages.map((pkg) => (
        <PackageCard
          key={toPackageSlug(pkg.namespace, pkg.package)}
          pkg={pkg}
          registryBaseUrl={options.registryBaseUrl}
          onFilterByOwner={options.onFilterByOwner}
        />
      ))}
    </Row>
  )
}
