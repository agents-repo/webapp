import type { ReactNode } from 'react'
import { Badge, Col, Container, Row, Stack } from 'react-bootstrap'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { CatalogResultsPanel } from '../components/PackageCatalogResults'
import { useCatalogIndexPage } from './useCatalogIndexPage'

interface HomePageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function HomePage({ setHeaderSearchSlot }: HomePageProps) {
  const { catalog } = useRegistryCatalog()
  const page = useCatalogIndexPage({
    catalog,
    packages: catalog?.packages ?? [],
    searchInputId: 'registry-package-search',
    setHeaderSearchSlot,
  })
  const resultsHeading = page.trimmedQuery
    ? `Search results for "${page.trimmedQuery}"`
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
                <div className={`w-100 hero-search${page.stickySearch ? ' d-lg-none' : ''}`}>
                  {page.searchControl}
                </div>
              </Stack>
            </Col>
          </Row>
        </Container>
      </section>

      <CatalogResultsPanel
        resultsHeading={resultsHeading}
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

export default HomePage
