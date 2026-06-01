import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleCheck, faClock, faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Alert, Badge, Card, Col, Container, Dropdown, Form, InputGroup, Row, Stack } from 'react-bootstrap'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import type { RegistryCatalog } from '../../domain/package'
import {
  filterRegistryPackages,
  formatCatalogUpdatedAt,
} from '../../application/registrySelectors'
import { loadRegistryCatalog } from '../../infrastructure/registryRepository'

const STICKY_SEARCH_THRESHOLD = 180

interface HomePageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

type CatalogCacheState = 'none' | 'fresh' | 'stale-fallback'

interface CatalogAlertState {
  variant: 'warning' | 'danger'
  message: string
}

const isSafeExternalHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const getCatalogSummary = ({
  catalog,
  cacheState,
  isLoading,
}: {
  catalog: RegistryCatalog | null
  cacheState: CatalogCacheState
  isLoading: boolean
}): string => {
  if (isLoading) {
    return 'Loading registry catalog from configured source...'
  }

  if (!catalog) {
    return 'Registry catalog unavailable due to a loading error.'
  }

  const summaryPrefix = `Updated ${formatCatalogUpdatedAt(catalog.updatedAt)} with ${catalog.packages.length} packages`

  switch (cacheState) {
    case 'fresh':
      return `${summaryPrefix} from 24h cache.`
    case 'stale-fallback':
      return `${summaryPrefix} from stale cache after remote refresh failure.`
    default:
      return `${summaryPrefix} from remote index data.`
  }
}

const getCatalogAlertState = ({
  hasCatalog,
  cacheState,
  errorMessage,
}: {
  hasCatalog: boolean
  cacheState: CatalogCacheState
  errorMessage: string | null
}): CatalogAlertState | null => {
  if (!errorMessage) {
    return null
  }

  if (!hasCatalog) {
    return {
      variant: 'danger',
      message: 'Unable to load the registry index. No catalog data is available.',
    }
  }

  if (cacheState === 'stale-fallback') {
    return {
      variant: 'warning',
      message: 'Remote registry refresh failed. Displaying stale cached catalog while keeping the app available.',
    }
  }

  return null
}

function HomePage({ setHeaderSearchSlot }: HomePageProps) {
  const [query, setQuery] = useState('')
  const [stickySearch, setStickySearch] = useState(false)
  const [catalog, setCatalog] = useState<RegistryCatalog | null>(null)
  const [catalogCacheState, setCatalogCacheState] = useState<CatalogCacheState>('none')
  const [catalogSourceUrl, setCatalogSourceUrl] = useState('')
  const [catalogErrorMessage, setCatalogErrorMessage] = useState<string | null>(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const trimmedQuery = query.trim()
  const catalogSummary = getCatalogSummary({
    catalog,
    cacheState: catalogCacheState,
    isLoading: isCatalogLoading,
  })
  const catalogAlertState = getCatalogAlertState({
    hasCatalog: catalog !== null,
    cacheState: catalogCacheState,
    errorMessage: catalogErrorMessage,
  })
  const canShowCatalogSourceLink = isSafeExternalHttpUrl(catalogSourceUrl)

  useEffect(() => {
    const abortController = new AbortController()
    let isActive = true

    const loadCatalog = async (): Promise<void> => {
      const result = await loadRegistryCatalog({ signal: abortController.signal })

      if (!isActive) {
        return
      }

      setCatalog(result.catalog)
      setCatalogCacheState(result.cacheState)
      setCatalogSourceUrl(result.indexUrl)
      setCatalogErrorMessage(result.errorMessage ?? null)

      if (result.errorMessage) {
        console.warn('Registry catalog loading fallback triggered:', result.errorMessage)
      }

      setIsCatalogLoading(false)
    }

    void loadCatalog()

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const updateStickyState = (): void => {
      const nextStickySearch = globalThis.window.scrollY > STICKY_SEARCH_THRESHOLD
      setStickySearch((prev) => (prev === nextStickySearch ? prev : nextStickySearch))
    }

    updateStickyState()
    globalThis.window.addEventListener('scroll', updateStickyState, { passive: true })

    return () => {
      globalThis.window.removeEventListener('scroll', updateStickyState)
    }
  }, [])

  const filteredPackages = useMemo(() => {
    if (!catalog) {
      return []
    }

    return filterRegistryPackages(catalog, query)
  }, [catalog, query])

  const searchControl = useMemo(
    () => (
      <Form
        role="search"
        aria-label="Search packages"
        className="w-100"
        onSubmit={(event) => event.preventDefault()}
      >
        <InputGroup size="sm" className="search-control">
          <InputGroup.Text className="bg-primary border-primary text-white">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" aria-hidden="true" />
            Search
          </InputGroup.Text>
          <Form.Control
            size="sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by package, owner (@slug), description, or tag"
            aria-label="Search registry packages"
            className="border-secondary search-input"
          />
        </InputGroup>
      </Form>
    ),
    [query],
  )

  useEffect(() => {
    setHeaderSearchSlot(stickySearch ? searchControl : null)

    return () => {
      setHeaderSearchSlot(null)
    }
  }, [searchControl, setHeaderSearchSlot, stickySearch])

  return (
    <main>
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
                  Explore package templates for agents and flows
                </h1>
                <p className="lead fs-6 text-body-secondary mb-0">
                  Browse active package templates with quick metadata sourced from the registry index.
                </p>
                <div className={`w-100 hero-search${stickySearch ? ' d-lg-none' : ''}`}>{searchControl}</div>
                <p className="small text-body-secondary mb-0">{catalogSummary}</p>
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
                {trimmedQuery ? `Search results for "${trimmedQuery}"` : 'Recently updated packages'}
                {catalog ? (
                  <Badge bg="secondary" pill className="fw-normal">
                    schema v{catalog.schemaVersion}
                  </Badge>
                ) : null}
              </h2>
              <p className="text-body-secondary mb-0 small">
                Showing {filteredPackages.length} of {catalog?.packages.length ?? 0}
              </p>
            </Col>
          </Row>

          {catalogAlertState ? (
            <Alert variant={catalogAlertState.variant} className="mb-3">
              {catalogAlertState.message}
              {canShowCatalogSourceLink ? (
                <>
                  {' '}
                  <a href={catalogSourceUrl} target="_blank" rel="noreferrer noopener">
                    Check configured index URL
                  </a>.
                </>
              ) : null}
              {catalogErrorMessage ? <span className="small"> Details are available in the browser console.</span> : null}
            </Alert>
          ) : null}

          <Row xs={1} md={2} xl={3} className="g-3">
            {filteredPackages.map((pkg) => (
              <Col key={pkg.id}>
                <Card className="h-100 border-secondary-subtle package-card">
                  <Card.Header className="p-3 p-lg-4">
                    <Stack direction="horizontal" className="justify-content-between align-items-start">
                      <div className="me-2">
                        <Card.Title as="h3" className="h6 fw-semibold mb-0 lh-sm">
                          {pkg.name}
                        </Card.Title>
                        <Card.Subtitle as="div" className="small text-body-secondary mb-0 mt-1">
                          by{' '}
                          <Dropdown as="div" align="end" className="d-inline-block">
                            <Dropdown.Toggle
                              as="button"
                              id={`owner-actions-${pkg.id}`}
                              className="btn btn-link btn-sm p-0 text-body-secondary text-decoration-underline d-inline-flex align-items-center owner-dropdown-toggle"
                            >
                              {pkg.owner}
                              <FontAwesomeIcon icon={faChevronDown} size="xs" className="ms-1" aria-hidden="true" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                href={`https://github.com/${pkg.owner}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={`View GitHub profile for ${pkg.owner} (opens in a new tab)`}
                              >
                                <FontAwesomeIcon icon={faGithub} className="me-2" aria-hidden="true" />
                                View GitHub profile
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => setQuery(`@${pkg.owner}`)}>
                                <FontAwesomeIcon icon={faFilter} className="me-2" aria-hidden="true" />
                                Filter packages by this owner
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Card.Subtitle>
                      </div>
                      <Badge bg={pkg.status === 'active' ? 'success' : 'secondary'}>
                        <FontAwesomeIcon
                          icon={pkg.status === 'active' ? faCircleCheck : faClock}
                          className="me-1"
                          aria-hidden="true"
                        />
                        {pkg.status}
                      </Badge>
                    </Stack>
                  </Card.Header>

                  <Card.Body className="d-flex flex-column gap-3 p-3 p-lg-4">
                    <Card.Text as="p" className="small text-body-secondary mb-0 package-description">
                      {pkg.description}
                    </Card.Text>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      <Badge bg="primary">v{pkg.latest}</Badge>
                      <Badge bg="secondary">{pkg.category}</Badge>
                      <Badge bg="info" text="dark">
                        {pkg.estimateOverallCost.band} cost
                      </Badge>
                    </Stack>

                    <div className="d-flex gap-2 flex-wrap">
                      {pkg.tags.map((tag) => (
                        <Badge key={tag} bg="light" text="dark" pill className="fw-normal">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {!isCatalogLoading && filteredPackages.length === 0 ? (
            <Card className="mt-4 border-secondary-subtle">
              <Card.Body className="text-center py-4">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" aria-hidden="true" />
                {catalog
                  ? 'No packages match your current search.'
                  : 'No catalog data available.'}
              </Card.Body>
            </Card>
          ) : null}
        </Container>
      </section>
    </main>
  )
}

export default HomePage
