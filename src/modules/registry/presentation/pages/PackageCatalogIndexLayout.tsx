import type { ReactNode } from 'react'
import { Badge, Button, Col, Container, Offcanvas, Row, Stack } from 'react-bootstrap'
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import {
  PackageCatalogFilterBody,
  PackageCatalogFilterChips,
} from '../components/PackageCatalogFilters'
import {
  CatalogAlert,
  CatalogLoadingSpinner,
  EmptyCatalogState,
  PackageCatalogGrid,
} from '../components/PackageCatalogResults'
import { usePackageCatalogIndexPage } from './usePackageCatalogIndexPage'

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

function FilterToggleButtons(options: {
  readonly sidebarVisible: boolean
  readonly selectedFacetCount: number
  readonly onToggleSidebar: () => void
  readonly onOpenOffcanvas: () => void
}): ReactNode {
  const filtersLabel =
    options.selectedFacetCount > 0 ? `Filters, ${options.selectedFacetCount} selected` : 'Filters'

  return (
    <>
      <Button
        type="button"
        variant="outline-secondary"
        size="sm"
        className="d-none d-lg-inline-flex"
        onClick={options.onToggleSidebar}
      >
        {options.sidebarVisible ? 'Hide filters' : 'Show filters'}
      </Button>
      <Button
        type="button"
        variant="outline-secondary"
        size="sm"
        className="d-lg-none"
        onClick={options.onOpenOffcanvas}
        aria-label={filtersLabel}
      >
        Filters
        {options.selectedFacetCount > 0 ? (
          <Badge bg="primary" pill className="ms-2">
            {options.selectedFacetCount}
          </Badge>
        ) : null}
      </Button>
    </>
  )
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
  const page = usePackageCatalogIndexPage({
    catalog,
    packages,
    searchInputId,
    searchAriaLabel,
    setHeaderSearchSlot,
  })
  const sidebarVisible = !page.sidebarCollapsed

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

      <section className="py-4 py-lg-5">
        <Container>
          <Row className="align-items-end mb-3 g-2">
            <Col lg={8}>
              <h2 className="h3 mb-1 d-flex align-items-center gap-2 flex-wrap">
                {resultsHeading(page.trimmedQuery)}
                {catalog?.schemaVersion ? (
                  <Badge bg="secondary" pill className="fw-normal">
                    schema v{catalog.schemaVersion}
                  </Badge>
                ) : null}
              </h2>
              <p
                id="catalog-results-summary"
                className="text-body-secondary mb-0 small"
                aria-live="polite"
                aria-atomic="true"
              >
                {page.catalogResultsSummary}
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <FilterToggleButtons
                sidebarVisible={sidebarVisible}
                selectedFacetCount={page.selectedFacetCount}
                onToggleSidebar={page.toggleSidebarCollapsed}
                onOpenOffcanvas={() => page.setFiltersOffcanvasOpen(true)}
              />
            </Col>
          </Row>

          {page.catalogAlertState ? (
            <CatalogAlert
              alertState={page.catalogAlertState}
              catalogSourceUrl={page.catalogSourceUrl}
              canShowCatalogSourceLink={page.canShowCatalogSourceLink}
              catalogErrorMessage={page.catalogErrorMessage}
            />
          ) : null}

          {page.showLoadingSpinner ? (
            <CatalogLoadingSpinner />
          ) : (
            <Row className="g-4">
              {sidebarVisible ? (
                <Col lg={3} className="d-none d-lg-block">
                  <h3 className="h5">Filters</h3>
                  <PackageCatalogFilterBody
                    idPrefix="sidebar"
                    facets={page.facets}
                    filters={page.filters}
                    onToggle={page.toggleFilter}
                  />
                </Col>
              ) : null}
              <Col lg={sidebarVisible ? 9 : 12}>
                <PackageCatalogFilterChips
                  popularChips={page.popularChips}
                  facets={page.facets}
                  filters={page.filters}
                  onToggle={page.toggleFilter}
                  onClear={page.clearFilters}
                />
                <PackageCatalogGrid
                  packages={page.filteredPackages}
                  registryBaseUrl={page.registryBaseUrl}
                  onFilterByOwner={page.filterByOwner}
                  onToggleFacet={(facet, value) => page.toggleFilter(facet, value)}
                  isFacetSelected={page.isFacetSelected}
                  xl={sidebarVisible ? 2 : 3}
                />
                {page.filteredPackages.length === 0 ? (
                  <EmptyCatalogState
                    hasCatalog={catalog !== null}
                    emptyMatchMessage="No packages match your current search or filters."
                  />
                ) : null}
              </Col>
            </Row>
          )}
        </Container>
      </section>

      <Offcanvas
        show={page.filtersOffcanvasOpen}
        onHide={() => page.setFiltersOffcanvasOpen(false)}
        placement="start"
        className="d-lg-none"
        aria-labelledby="package-catalog-filters-offcanvas-title"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="package-catalog-filters-offcanvas-title">Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <PackageCatalogFilterBody
            idPrefix="offcanvas"
            facets={page.facets}
            filters={page.filters}
            onToggle={page.toggleFilter}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}
