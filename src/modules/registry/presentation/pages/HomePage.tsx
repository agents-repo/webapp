import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { filterRegistryPackages } from '../../application/registrySelectors'
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

interface HomePageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function HomePage({ setHeaderSearchSlot }: HomePageProps) {
  const {
    catalog,
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

  const filteredPackages = useMemo(() => {
    if (!catalog) {
      return []
    }

    return filterRegistryPackages(catalog, query)
  }, [catalog, query])

  const catalogResultsSummary = getCatalogResultsSummary({
    catalog,
    filteredCount: filteredPackages.length,
    isLoading: isCatalogLoading,
  })

  const searchControl = useMemo(
    () => (
      <PackageCatalogSearch query={query} onQueryChange={setQuery} inputId="registry-package-search" />
    ),
    [query],
  )

  useEffect(() => {
    setHeaderSearchSlot(stickySearch ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [searchControl, setHeaderSearchSlot, stickySearch])

  const showLoadingSpinner = isCatalogLoading && !catalog
  const resultsHeading = trimmedQuery
    ? `Search results for "${trimmedQuery}"`
    : 'Recently updated packages'

  return (
    <>
      <section className="py-4 py-lg-5 border-bottom border-secondary-subtle app-hero">
        <Container>
          <Row className="justify-content-center">
            <Col xl={8} className="text-center">
              <Stack gap={3} className="align-items-center">
                <img src={brandLogo} width="72" height="72" alt="Agents Repo brand symbol" />
                <Badge bg="primary" pill>
                  Curated package registry
                </Badge>
                <h1 className="display-5 fw-semibold mb-0">
                  Explore ready-to-use agents and flows
                </h1>
                <p className="lead fs-6 text-body-secondary mb-0">
                  Browse agents and flows for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex—ready
                  for direct use in your projects, with quick metadata from the registry index.
                </p>
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
                {resultsHeading}
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

export default HomePage
