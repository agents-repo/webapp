import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { filterRegistryPackages } from '../../application/registrySelectors'
import type { RegistryCatalog, RegistryPackage } from '../../domain/package'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { useStickySearch } from '../components/useStickySearch'
import { PackageCatalogSearch } from '../components/PackageCatalogSearch'
import {
  CatalogAlert,
  CatalogLoadingSpinner,
  EmptyCatalogState,
  PackageCatalogGrid,
} from '../components/PackageCatalogResults'
import { getCatalogAlertState, getCatalogResultsSummary } from './homePageCatalogState'

const STICKY_SEARCH_THRESHOLD = 180

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
  const {
    cacheState: catalogCacheState,
    indexUrl: catalogSourceUrl,
    registryBaseUrl,
    errorMessage: catalogErrorMessage,
    isLoading: isCatalogLoading,
  } = useRegistryCatalog()
  const [query, setQuery] = useState('')
  const stickySearch = useStickySearch(STICKY_SEARCH_THRESHOLD)
  const trimmedQuery = query.trim()
  const catalogAlertState = getCatalogAlertState({
    hasCatalog: catalog !== null,
    cacheState: catalogCacheState,
    errorMessage: catalogErrorMessage,
  })
  const canShowCatalogSourceLink = isSafeExternalHttpUrl(catalogSourceUrl)

  const scopedCatalog = useMemo<RegistryCatalog | null>(() => {
    if (!catalog) {
      return null
    }

    return { ...catalog, packages: [...packages] }
  }, [catalog, packages])

  const filteredPackages = useMemo(() => {
    if (!scopedCatalog) {
      return []
    }

    return filterRegistryPackages(scopedCatalog, query)
  }, [query, scopedCatalog])

  const catalogResultsSummary = getCatalogResultsSummary({
    catalog: scopedCatalog,
    filteredCount: filteredPackages.length,
    isLoading: isCatalogLoading,
  })

  const searchControl = useMemo(
    () => (
      <PackageCatalogSearch
        query={query}
        onQueryChange={setQuery}
        inputId={searchInputId}
        ariaLabel={searchAriaLabel}
      />
    ),
    [query, searchAriaLabel, searchInputId],
  )

  useEffect(() => {
    setHeaderSearchSlot(stickySearch ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [searchControl, setHeaderSearchSlot, stickySearch])

  const showLoadingSpinner = isCatalogLoading && !catalog

  return (
    <>
      <section className="py-4 py-lg-5 border-bottom border-secondary-subtle app-hero">
        <Container>
          <Row className="justify-content-center">
            <Col xl={8} className="text-center">
              <Stack gap={3} className="align-items-center">
                <h1 className="display-6 fw-semibold mb-0">{title}</h1>
                <p className="lead fs-6 text-body-secondary mb-0">{lead}</p>
                <div className={`w-100 hero-search${stickySearch ? ' d-lg-none' : ''}`}>{searchControl}</div>
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
                {resultsHeading(trimmedQuery)}
                {catalog ? (
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
                {catalogResultsSummary}
              </p>
            </Col>
          </Row>

          {catalogAlertState ? (
            <CatalogAlert
              alertState={catalogAlertState}
              catalogSourceUrl={catalogSourceUrl}
              canShowCatalogSourceLink={canShowCatalogSourceLink}
              catalogErrorMessage={catalogErrorMessage}
            />
          ) : null}

          {showLoadingSpinner ? (
            <CatalogLoadingSpinner />
          ) : (
            <>
              <PackageCatalogGrid
                packages={filteredPackages}
                registryBaseUrl={registryBaseUrl}
                onFilterByOwner={(owner) => setQuery(`@${owner}`)}
              />

              {filteredPackages.length === 0 ? <EmptyCatalogState hasCatalog={catalog !== null} /> : null}
            </>
          )}
        </Container>
      </section>
    </>
  )
}
