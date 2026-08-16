import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Alert, Badge, Card, Col, Container, Row } from 'react-bootstrap'
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
          </a>.
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

export function CatalogResultsPanel(options: {
  readonly resultsHeading: string
  readonly schemaVersion?: string
  readonly catalogResultsSummary: string
  readonly catalogAlertState: NonNullable<ReturnType<typeof getCatalogAlertState>> | null
  readonly catalogSourceUrl: string
  readonly canShowCatalogSourceLink: boolean
  readonly catalogErrorMessage: string | null
  readonly showLoadingSpinner: boolean
  readonly filteredPackages: readonly RegistryPackage[]
  readonly hasCatalog: boolean
  readonly registryBaseUrl: string
  readonly onFilterByOwner: (owner: string) => void
}): ReactNode {
  return (
    <section className="py-4 py-lg-5">
      <Container>
        <Row className="align-items-end mb-3 g-2">
          <Col lg={8}>
            <h2 className="h3 mb-1 d-flex align-items-center gap-2 flex-wrap">
              {options.resultsHeading}
              {options.schemaVersion ? (
                <Badge bg="secondary" pill className="fw-normal">
                  schema v{options.schemaVersion}
                </Badge>
              ) : null}
            </h2>
            <p
              id="catalog-results-summary"
              className="text-body-secondary mb-0 small"
              aria-live="polite"
              aria-atomic="true"
            >
              {options.catalogResultsSummary}
            </p>
          </Col>
        </Row>

        {options.catalogAlertState ? (
          <CatalogAlert
            alertState={options.catalogAlertState}
            catalogSourceUrl={options.catalogSourceUrl}
            canShowCatalogSourceLink={options.canShowCatalogSourceLink}
            catalogErrorMessage={options.catalogErrorMessage}
          />
        ) : null}

        {options.showLoadingSpinner ? (
          <CatalogLoadingSpinner />
        ) : (
          <>
            <PackageCatalogGrid
              packages={options.filteredPackages}
              registryBaseUrl={options.registryBaseUrl}
              onFilterByOwner={options.onFilterByOwner}
            />

            {options.filteredPackages.length === 0 ? (
              <EmptyCatalogState hasCatalog={options.hasCatalog} />
            ) : null}
          </>
        )}
      </Container>
    </section>
  )
}
