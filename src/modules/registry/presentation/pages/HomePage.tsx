import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Card, Col, Container, Form, InputGroup, Row, Stack } from 'react-bootstrap'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import {
  filterRegistryPackages,
  formatCatalogUpdatedAt,
} from '../../application/registrySelectors'
import { getMockRegistryCatalog } from '../../infrastructure/mockRegistryRepository'

const STICKY_SEARCH_THRESHOLD = 180

interface HomePageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function HomePage({ setHeaderSearchSlot }: HomePageProps) {
  const [query, setQuery] = useState('')
  const [stickySearch, setStickySearch] = useState(false)
  const catalog = getMockRegistryCatalog()

  useEffect(() => {
    const updateStickyState = (): void => {
      setStickySearch(window.scrollY > STICKY_SEARCH_THRESHOLD)
    }

    updateStickyState()
    window.addEventListener('scroll', updateStickyState, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateStickyState)
    }
  }, [])

  const filteredPackages = useMemo(() => {
    return filterRegistryPackages(catalog, query)
  }, [catalog, query])

  const searchControl = useMemo(
    () => (
      <Form role="search" aria-label="Search packages" className="w-100">
        <InputGroup size="sm" className="search-control">
          <InputGroup.Text className="bg-primary border-primary text-white">
            Search
          </InputGroup.Text>
          <Form.Control
            size="sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by package, description, or tag"
            aria-label="Search registry packages"
            className="bg-dark text-light border-secondary search-input"
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
                <img src={brandLogo} width="72" height="72" alt="agents-repo brand symbol" />
                <Badge bg="primary" pill>
                  Curated package registry
                </Badge>
                <h1 className="display-5 fw-semibold mb-0">
                  Explore package templates for agents and flows
                </h1>
                <p className="lead fs-6 text-body-secondary mb-0">
                  Browse active package templates with quick metadata using local mock data.
                </p>
                {stickySearch ? null : <div className="w-100 hero-search">{searchControl}</div>}
                <p className="small text-body-secondary mb-0">
                  Updated {formatCatalogUpdatedAt(catalog.updatedAt)} with{' '}
                  {catalog.packages.length} packages in this mock view.
                </p>
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
                Recently updated packages
                <Badge bg="secondary" pill className="fw-normal">
                  schema v{catalog.schemaVersion}
                </Badge>
              </h2>
              <p className="text-body-secondary mb-0 small">
                Showing {filteredPackages.length} of {catalog.packages.length}
              </p>
            </Col>
          </Row>

          <Row xs={1} md={2} xl={3} className="g-3">
            {filteredPackages.map((pkg) => (
              <Col key={pkg.id}>
                <Card
                  bg="dark"
                  text="light"
                  className="h-100 border-secondary-subtle shadow-sm package-card"
                >
                  <Card.Body className="d-flex flex-column gap-2 p-3 p-lg-4">
                    <div>
                      <Stack
                        direction="horizontal"
                        className="justify-content-between align-items-start mb-2"
                      >
                        <h3 className="h6 fw-semibold mb-0 me-2 lh-sm">{pkg.name}</h3>
                        <Badge bg={pkg.status === 'active' ? 'success' : 'secondary'}>
                          {pkg.status}
                        </Badge>
                      </Stack>
                      <p className="small text-body-secondary mb-0 package-description">
                        {pkg.description}
                      </p>
                    </div>

                    <Stack direction="horizontal" gap={2} className="flex-wrap pt-1">
                      <Badge bg="primary">v{pkg.latest}</Badge>
                      <Badge bg="secondary">{pkg.category}</Badge>
                      <Badge bg="info" text="dark">
                        {pkg.estimateOverallCost.band} cost
                      </Badge>
                    </Stack>

                    <div className="d-flex gap-2 flex-wrap mt-auto">
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

          {filteredPackages.length === 0 ? (
            <Card bg="dark" text="light" className="mt-4 border-secondary-subtle">
              <Card.Body className="text-center py-4">
                No packages match your current search.
              </Card.Body>
            </Card>
          ) : null}
        </Container>
      </section>
    </main>
  )
}

export default HomePage
