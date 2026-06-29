import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faCircleCheck,
  faClock,
  faDownload,
  faEye,
  faFilter,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Row,
  Stack,
} from 'react-bootstrap'
import brandLogo from '../../../../assets/logo/agents-repo-logo.svg'
import { externalLinkAccessibleName } from '../../../site/application/accessibility/externalLink'
import { sitePageMeta } from '../../../site/application/accessibility/sitePageMeta'
import { useDocumentTitle } from '../../../site/application/accessibility/useDocumentTitle'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { siteRoutes } from '../../../site/presentation/routes/siteRoutes'
import type { RegistryCatalogStatusNote } from '../../../site/application/websiteSettings/registryCatalogStatusNote'
import type { InstallTargetEntry, PackageStatus, RegistryCatalog, RegistryPackage } from '../../domain/package'
import { getInstallTargetLabel } from '../../application/installTargets'
import {
  filterRegistryPackages,
  formatCatalogUpdatedAt,
} from '../../application/registrySelectors'
import { loadRegistryCatalog } from '../../infrastructure/registryRepository'
import { buildRegistryArtifactUrl, buildRegistryPackageBrowseUrl } from '../../infrastructure/registrySourceUrl'

const STICKY_SEARCH_THRESHOLD = 180

interface PackageDownloadTarget {
  id: InstallTargetEntry['id']
  status: InstallTargetEntry['status']
  label: string
  href: string
}

const PACKAGE_STATUS_BADGE: Record<PackageStatus, { bg: string; icon: typeof faCircleCheck }> = {
  active: { bg: 'success', icon: faCircleCheck },
  deprecated: { bg: 'warning', icon: faClock },
  archived: { bg: 'secondary', icon: faClock },
  yanked: { bg: 'danger', icon: faClock },
}

const getPackageDownloadTargets = (
  pkg: RegistryPackage,
  registryBaseUrl: string,
): PackageDownloadTarget[] => {
  if (!registryBaseUrl.trim()) {
    return []
  }

  return (pkg.installTargets ?? [])
    .map((target) => ({
      ...target,
      label: getInstallTargetLabel(target.id),
      href: buildRegistryArtifactUrl(registryBaseUrl, pkg.id, pkg.latest, target.id),
    }))
    .filter((target) => isSafeExternalHttpUrl(target.href))
}

const renderPackageDownloadAction = (
  pkg: RegistryPackage,
  downloadTargets: PackageDownloadTarget[],
): ReactNode => (
  <Dropdown align="end">
    <Dropdown.Toggle
      variant="outline-primary"
      size="lg"
      id={`download-actions-${pkg.id}`}
      className="d-inline-flex align-items-center justify-content-center"
      aria-label={`Download ${pkg.name}`}
    >
      <FontAwesomeIcon icon={faDownload} aria-hidden="true" className="me-1" />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {downloadTargets.map((target) => (
        <Dropdown.Item
          key={target.id}
          href={target.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Download ${pkg.name} for ${target.label} (opens in a new tab)`}
        >
          {target.label}
          {target.status === 'experimental' ? (
            <Badge bg="warning" text="dark" pill className="ms-2 fw-normal">
              experimental
            </Badge>
          ) : null}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
)

interface HomePageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
  readonly registrySettingsVersion: number
  readonly onCatalogStatusNoteChange: (note: RegistryCatalogStatusNote | null) => void
}

type CatalogCacheState = 'none' | 'fresh' | 'stale-fallback'

interface CatalogAlertState {
  variant: 'warning' | 'danger'
  message: string
}

const getCatalogStatusTag = ({
  catalog,
  cacheState,
  isLoading,
  errorMessage,
}: {
  catalog: RegistryCatalog | null
  cacheState: CatalogCacheState
  isLoading: boolean
  errorMessage: string | null
}): string => {
  if (isLoading) {
    return 'loading'
  }

  if (!catalog) {
    return 'unavailable'
  }

  switch (cacheState) {
    case 'fresh':
      return errorMessage
        ? 'cached catalog after source resolution failure'
        : 'fresh cache'
    case 'stale-fallback':
      return 'stale cache after refresh failure'
    default:
      return errorMessage ? 'remote refresh failed' : 'remote source'
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

  if (cacheState === 'fresh') {
    return {
      variant: 'warning',
      message:
        'Registry source resolution failed. Displaying cached catalog while keeping the app available.',
    }
  }

  return null
}

const getCatalogResultsSummary = ({
  catalog,
  filteredCount,
  isLoading,
}: {
  catalog: RegistryCatalog | null
  filteredCount: number
  isLoading: boolean
}): string => {
  if (catalog) {
    return `Showing ${filteredCount} of ${catalog.packages.length} packages`
  }

  if (isLoading) {
    return 'Loading registry catalog'
  }

  return 'No catalog data available'
}

function HomePage({
  setHeaderSearchSlot,
  registrySettingsVersion,
  onCatalogStatusNoteChange,
}: HomePageProps) {
  useDocumentTitle(sitePageMeta[siteRoutes.home].title)
  const [query, setQuery] = useState('')
  const [stickySearch, setStickySearch] = useState(false)
  const [catalog, setCatalog] = useState<RegistryCatalog | null>(null)
  const [catalogCacheState, setCatalogCacheState] = useState<CatalogCacheState>('none')
  const [catalogSourceUrl, setCatalogSourceUrl] = useState('')
  const [registryBaseUrl, setRegistryBaseUrl] = useState('')
  const [githubRepositoryUrl, setGithubRepositoryUrl] = useState('')
  const [catalogErrorMessage, setCatalogErrorMessage] = useState<string | null>(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const trimmedQuery = query.trim()
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
      setIsCatalogLoading(true)
      const result = await loadRegistryCatalog({ signal: abortController.signal })

      if (!isActive) {
        return
      }

      setCatalog(result.catalog)
      setCatalogCacheState(result.cacheState)
      setCatalogSourceUrl(result.indexUrl)
      setRegistryBaseUrl(result.registryBaseUrl)
      setGithubRepositoryUrl(result.githubRepositoryUrl ?? '')
      setCatalogErrorMessage(result.errorMessage ?? null)

      const noteStatusTag = getCatalogStatusTag({
        catalog: result.catalog,
        cacheState: result.cacheState,
        isLoading: false,
        errorMessage: result.errorMessage ?? null,
      })

      onCatalogStatusNoteChange({
        summaryText: result.catalog
          ? `Updated ${formatCatalogUpdatedAt(result.catalog.updatedAt)} with ${result.catalog.packages.length} packages from `
          : 'Registry catalog unavailable from ',
        sourceUrl: result.indexUrl,
        statusTag: noteStatusTag,
        baseUrlRefResolution: result.baseUrlRefResolution ?? null,
        githubRepositoryRefResolution: result.githubRepositoryRefResolution ?? null,
      })

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
  }, [onCatalogStatusNoteChange, registrySettingsVersion])

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

  const catalogResultsSummary = getCatalogResultsSummary({
    catalog,
    filteredCount: filteredPackages.length,
    isLoading: isCatalogLoading,
  })

  const searchControl = useMemo(
    () => (
      <Form
        role="search"
        aria-label="Search packages"
        className="w-100"
        onSubmit={(event) => event.preventDefault()}
      >
        <Form.Label htmlFor="registry-package-search" className="visually-hidden">
          Search registry packages
        </Form.Label>
        <InputGroup size="sm" className="search-control">
          <InputGroup.Text className="bg-primary border-primary text-white">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" aria-hidden="true" />
            Search
          </InputGroup.Text>
          <Form.Control
            id="registry-package-search"
            size="sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by package, owner (@slug), description, or tag"
            className="border-secondary search-input"
          />
          <button type="submit" className="visually-hidden">
            Search
          </button>
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
    <main id="main-content" tabIndex={-1}>
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
                  Browse agents and flows ready for direct use in your projects, with quick metadata from
                  the registry index.
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
                {trimmedQuery ? `Search results for "${trimmedQuery}"` : 'Recently updated packages'}
                {catalog ? (
                  <Badge bg="secondary" pill className="fw-normal">
                    schema v{catalog.schemaVersion}
                  </Badge>
                ) : null}
              </h2>
              <p className="text-body-secondary mb-0 small" aria-live="polite" aria-atomic="true">
                {catalogResultsSummary}
              </p>
            </Col>
          </Row>

          {catalogAlertState ? (
            <Alert variant={catalogAlertState.variant} className="mb-3">
              {catalogAlertState.message}
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
          ) : null}

          <Row xs={1} md={2} xl={3} className="g-3">
            {filteredPackages.map((pkg) => {
              const statusBadge = PACKAGE_STATUS_BADGE[pkg.status]
              const downloadTargets = getPackageDownloadTargets(pkg, registryBaseUrl)
              const packageBrowseUrl = buildRegistryPackageBrowseUrl(githubRepositoryUrl, pkg.id)
              const safeBrowseUrl =
                packageBrowseUrl && isSafeExternalHttpUrl(packageBrowseUrl) ? packageBrowseUrl : null

              return (
              <Col key={pkg.id}>
                <Card className="h-100 d-flex flex-column border-secondary-subtle package-card">
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
                              aria-label={`Actions for owner ${pkg.owner}`}
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
                      <Badge bg={statusBadge.bg}>
                        <FontAwesomeIcon icon={statusBadge.icon} className="me-1" aria-hidden="true" />
                        {pkg.status}
                      </Badge>
                    </Stack>
                  </Card.Header>

                  <Card.Body className="d-flex flex-column flex-grow-1 gap-3 p-3 p-lg-4">
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

                  {downloadTargets.length > 0 || safeBrowseUrl ? (
                    <Card.Footer className="d-flex justify-content-center gap-2">
                      {downloadTargets.length > 0 ? renderPackageDownloadAction(pkg, downloadTargets) : null}
                      {safeBrowseUrl ? (
                        <Button
                          as="a"
                          href={safeBrowseUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          variant="outline-primary"
                          size="lg"
                          className="d-inline-flex align-items-center justify-content-center"
                          aria-label={`View ${pkg.name} on GitHub (opens in a new tab)`}
                        >
                          <FontAwesomeIcon icon={faEye} aria-hidden="true" />
                        </Button>
                      ) : null}
                    </Card.Footer>
                  ) : null}
                </Card>
              </Col>
            )})}
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
