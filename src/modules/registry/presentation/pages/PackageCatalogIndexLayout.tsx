import type { ReactNode } from 'react'
import { Col, Container, Row, Stack } from 'react-bootstrap'
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import { CatalogResultsPanel } from '../components/PackageCatalogResults'
import { useCatalogIndexPage } from './useCatalogIndexPage'

export interface PackageCatalogIndexLayoutProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
  readonly title: string
  readonly lead: string
  readonly resultsHeading: (trimmedQuery: string) => string
  readonly searchInputId: string
  readonly searchAriaLabel: string
  readonly packages: readonly RegistryPackage[]
  readonly catalog: RegistryCatalog | null
}

export function PackageCatalogIndexLayout({
  setHeaderSearchSlot,
  title,
  lead,
  resultsHeading,
  searchInputId,
  searchAriaLabel,
  packages,
  catalog,
}: PackageCatalogIndexLayoutProps) {
  const page = useCatalogIndexPage({
    catalog,
    packages,
    searchInputId,
    searchAriaLabel,
    setHeaderSearchSlot,
  })

  return (
    <>
      <section className="py-4 py-lg-5 border-bottom border-secondary-subtle app-hero">
        <Container>
          <Row className="justify-content-center">
            <Col xl={8} className="text-center">
              <Stack gap={3} className="align-items-center">
                <h1 className="display-6 fw-semibold mb-0">{title}</h1>
                <p className="lead fs-6 text-body-secondary mb-0">{lead}</p>
                <div className={`w-100 hero-search${page.stickySearch ? ' d-lg-none' : ''}`}>
                  {page.searchControl}
                </div>
              </Stack>
            </Col>
          </Row>
        </Container>
      </section>

      <CatalogResultsPanel
        resultsHeading={resultsHeading(page.trimmedQuery)}
        schemaVersion={catalog?.schemaVersion}
        catalogResultsSummary={page.catalogResultsSummary}
        catalogAlertState={page.catalogAlertState}
        catalogSourceUrl={page.catalogSourceUrl}
        canShowCatalogSourceLink={page.canShowCatalogSourceLink}
        catalogErrorMessage={page.catalogErrorMessage}
        showLoadingSpinner={page.showLoadingSpinner}
        filteredPackages={page.filteredPackages}
        hasCatalog={catalog !== null}
        registryBaseUrl={page.registryBaseUrl}
        onFilterByOwner={(owner) => page.setQuery(`@${owner}`)}
      />
    </>
  )
}
