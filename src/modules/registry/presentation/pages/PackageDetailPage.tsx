import { useEffect, useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faClock,
  faDownload,
  faExternalLink,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import {
  Alert,
  Badge,
  Card,
  Col,
  Container,
  Dropdown,
  Row,
  Stack,
} from 'react-bootstrap'
import { NavLink, useParams } from 'react-router-dom'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { externalLinkAccessibleName } from '../../../site/application/accessibility/externalLink'
import {
  findRegistryPackage,
  getNamespacePackagesPath,
  getPackagesIndexPath,
} from '../../application/packageSiteRoutes'
import { formatRegistryPackageRef, toPackageSlug, type PackageStatus, type RegistryPackage } from '../../domain/package'
import type { PackageDetailDocument } from '../../domain/packageDetail'
import { loadPackageDetail } from '../../infrastructure/packageDetailRepository'
import { buildRegistryPackageBrowseUrl } from '../../infrastructure/registrySourceUrl'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import PackageCliInstallAction from '../components/PackageCliInstallAction'
import PackageInstructionAccordion from '../components/PackageInstructionAccordion'
import PackageMarkdown from '../components/PackageMarkdown'
import PackageUseInChatAction from '../components/PackageUseInChatAction'
import { faDuotoneSpinner } from './catalogLoadingSpinnerIcon'
import {
  getPackageDownloadTargets,
  type PackageDownloadTarget,
} from './homePageCatalogState'
import PackageSiteNotFound from './PackageSiteNotFound'

const PACKAGE_STATUS_BADGE: Record<PackageStatus, { bg: string; icon: typeof faCircleCheck }> = {
  active: { bg: 'success', icon: faCircleCheck },
  deprecated: { bg: 'warning', icon: faClock },
  archived: { bg: 'secondary', icon: faClock },
  yanked: { bg: 'danger', icon: faClock },
}

interface PackageDetailPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function PackageDetailDownloadMenu(options: {
  readonly packageName: string
  readonly packageSlug: string
  readonly downloadTargets: PackageDownloadTarget[]
}): ReactNode {
  const { packageName, packageSlug, downloadTargets } = options
  if (downloadTargets.length === 0) {
    return null
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="outline-primary"
        id={`download-actions-detail-${packageSlug}`}
        className="d-inline-flex align-items-center justify-content-center package-card-action"
        aria-label={`Download ${packageName}`}
      >
        <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
        <span className="package-card-action-label">Download</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {downloadTargets.map((target) => (
          <Dropdown.Item
            key={target.id}
            href={target.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Download ${packageName} for ${target.label} (opens in a new tab)`}
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
}

function PackageDetailHeader(options: {
  readonly catalogPackage: RegistryPackage
  readonly registryBaseUrl: string
  readonly githubRepositoryUrl: string
}): ReactNode {
  const { catalogPackage, registryBaseUrl, githubRepositoryUrl } = options
  const statusBadge = PACKAGE_STATUS_BADGE[catalogPackage.status]
  const packageSlug = toPackageSlug(catalogPackage.namespace, catalogPackage.package)
  const downloadTargets = getPackageDownloadTargets(catalogPackage, registryBaseUrl)
  const cliPackageRef = formatRegistryPackageRef(catalogPackage.namespace, catalogPackage.package)
  const githubUrl = buildRegistryPackageBrowseUrl(
    githubRepositoryUrl,
    catalogPackage.namespace,
    catalogPackage.package,
  )
  const safeGithubUrl = githubUrl && isSafeExternalHttpUrl(githubUrl) ? githubUrl : null

  return (
    <div>
      <Stack direction="horizontal" gap={2} className="flex-wrap align-items-center mb-2">
        <h1 className="h2 mb-0">{catalogPackage.name}</h1>
        <Badge bg={statusBadge.bg}>
          <FontAwesomeIcon icon={statusBadge.icon} className="me-1" aria-hidden="true" />
          {catalogPackage.status}
        </Badge>
      </Stack>
      <p className="text-body-secondary mb-2">
        by{' '}
        <NavLink to={getNamespacePackagesPath(catalogPackage.namespace)}>{catalogPackage.owner}</NavLink>
      </p>
      <p className="mb-3">{catalogPackage.description}</p>
      <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
        <Badge bg="primary">v{catalogPackage.latest}</Badge>
        <Badge bg="secondary">{catalogPackage.category}</Badge>
        <Badge bg="info" text="dark">
          {catalogPackage.estimateOverallCost.band} cost
        </Badge>
        {catalogPackage.tags.map((tag) => (
          <Badge key={tag} bg="light" text="dark" pill className="fw-normal">
            #{tag}
          </Badge>
        ))}
      </Stack>
      <div className="d-flex gap-2 flex-wrap">
        {cliPackageRef ? (
          <PackageCliInstallAction
            packageName={catalogPackage.name}
            packageId={cliPackageRef}
            controlId={`${packageSlug}-detail`}
          />
        ) : null}
        {catalogPackage.chatWeb ? (
          <PackageUseInChatAction
            packageName={catalogPackage.name}
            namespace={catalogPackage.namespace}
            packageId={catalogPackage.package}
            latest={catalogPackage.latest}
            registryBaseUrl={registryBaseUrl}
            controlId={`${packageSlug}-detail`}
            quickstart={catalogPackage.quickstart}
          />
        ) : null}
        <PackageDetailDownloadMenu
          packageName={catalogPackage.name}
          packageSlug={`${packageSlug}-detail`}
          downloadTargets={downloadTargets}
        />
        {safeGithubUrl ? (
          <a
            href={safeGithubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center package-card-action"
            aria-label={externalLinkAccessibleName(`View ${catalogPackage.name} on GitHub`)}
          >
            <FontAwesomeIcon icon={faGithub} aria-hidden="true" />
            <span className="package-card-action-label">View on GitHub</span>
          </a>
        ) : null}
      </div>
    </div>
  )
}

function MetadataRow(options: {
  readonly term: string
  readonly children: ReactNode
}): ReactNode {
  return (
    <>
      <dt className="col-sm-4">{options.term}</dt>
      <dd className="col-sm-8">{options.children}</dd>
    </>
  )
}

function PackageHomepageLink({ homepage }: { readonly homepage: string }): ReactNode {
  return (
    <a
      href={homepage}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={externalLinkAccessibleName('Package homepage')}
    >
      {homepage}
      <FontAwesomeIcon icon={faExternalLink} className="ms-1" aria-hidden="true" />
    </a>
  )
}

function getSafeHomepage(homepage: string | undefined): string | null {
  if (!homepage || !isSafeExternalHttpUrl(homepage)) {
    return null
  }

  return homepage
}

function PackageDetailMetadataCard(options: {
  readonly catalogPackage: RegistryPackage
  readonly detail: PackageDetailDocument | null
}): ReactNode {
  const metadata = options.detail?.metadata
  const homepage = getSafeHomepage(metadata?.homepage)
  const maintainers = metadata?.maintainers ?? []
  const installTargets = options.catalogPackage.installTargets ?? []
  const license = metadata?.license

  return (
    <Card className="h-100 border-secondary-subtle">
      <Card.Body>
        <h2 className="h4">Metadata</h2>
        <dl className="row mb-0 small">
          {license ? <MetadataRow term="License">{license}</MetadataRow> : null}
          {homepage ? (
            <MetadataRow term="Homepage">
              <PackageHomepageLink homepage={homepage} />
            </MetadataRow>
          ) : null}
          {maintainers.length > 0 ? (
            <MetadataRow term="Maintainers">{maintainers.join(', ')}</MetadataRow>
          ) : null}
          {installTargets.length > 0 ? (
            <MetadataRow term="Install targets">
              {installTargets.map((target) => `${target.id} (${target.status})`).join(', ')}
            </MetadataRow>
          ) : null}
        </dl>
      </Card.Body>
    </Card>
  )
}

function PackageDetailVersionsCard(options: {
  readonly detail: PackageDetailDocument | null
  readonly isDetailLoading: boolean
}): ReactNode {
  const { detail, isDetailLoading } = options

  return (
    <Card className="h-100 border-secondary-subtle">
      <Card.Body>
        <h2 className="h4">Versions</h2>
        {detail?.versions.entries.length ? (
          <ul className="mb-0">
            {detail.versions.entries.map((entry) => (
              <li key={entry.version}>
                <strong>{entry.version}</strong>
                {entry.version === detail.versions.latest ? ' (latest)' : ''}
                <span className="text-body-secondary"> · {entry.artifacts.length} artifact(s)</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-0 text-body-secondary">
            {isDetailLoading ? 'Loading version list…' : 'No version list available.'}
          </p>
        )}
      </Card.Body>
    </Card>
  )
}

function PackageDetailLoaded(options: {
  readonly catalogPackage: RegistryPackage
  readonly registryBaseUrl: string
  readonly githubRepositoryUrl: string
}): ReactNode {
  const { catalogPackage, registryBaseUrl, githubRepositoryUrl } = options
  const [detail, setDetail] = useState<PackageDetailDocument | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(Boolean(registryBaseUrl))

  useEffect(() => {
    if (!registryBaseUrl) {
      return
    }

    const abortController = new AbortController()
    let isActive = true

    void loadPackageDetail({
      registryBaseUrl,
      namespace: catalogPackage.namespace,
      packageId: catalogPackage.package,
      latest: catalogPackage.latest,
      signal: abortController.signal,
    })
      .then((payload) => {
        if (isActive) {
          setDetail(payload)
        }
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof DOMException && error.name === 'AbortError')) {
          return
        }

        setDetailError(error instanceof Error ? error.message : 'Unable to load package detail.')
      })
      .finally(() => {
        if (isActive) {
          setIsDetailLoading(false)
        }
      })

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [catalogPackage, registryBaseUrl])

  return (
    <div className="py-4 py-lg-5">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-3 package-detail-breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <NavLink to={getPackagesIndexPath()}>Packages</NavLink>
            </li>
            <li className="breadcrumb-item">
              <NavLink to={getNamespacePackagesPath(catalogPackage.namespace)}>
                {catalogPackage.namespace}
              </NavLink>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {catalogPackage.name}
            </li>
          </ol>
        </nav>

        <Stack gap={4}>
          <PackageDetailHeader
            catalogPackage={catalogPackage}
            registryBaseUrl={registryBaseUrl}
            githubRepositoryUrl={githubRepositoryUrl}
          />

          <Row className="g-3">
            <Col md={6}>
              <PackageDetailMetadataCard catalogPackage={catalogPackage} detail={detail} />
            </Col>
            <Col md={6}>
              <PackageDetailVersionsCard detail={detail} isDetailLoading={isDetailLoading} />
            </Col>
          </Row>

          {detailError ? <Alert variant="warning">{detailError}</Alert> : null}

          <Card className="border-secondary-subtle">
            <Card.Body>
              <h2 className="h4">Agents</h2>
              <PackageInstructionAccordion
                kind="agent"
                entries={detail?.agents ?? []}
                registryBaseUrl={registryBaseUrl}
              />
            </Card.Body>
          </Card>

          <Card className="border-secondary-subtle">
            <Card.Body>
              <h2 className="h4">Flows</h2>
              <PackageInstructionAccordion
                kind="flow"
                entries={detail?.flows ?? []}
                registryBaseUrl={registryBaseUrl}
              />
            </Card.Body>
          </Card>

          <Card className="border-secondary-subtle">
            <Card.Body>
              <h2 className="h4">README</h2>
              {detail?.readmeMarkdown ? (
                <PackageMarkdown markdown={detail.readmeMarkdown} />
              ) : (
                <p className="mb-0 text-body-secondary">
                  {isDetailLoading ? 'Loading README…' : 'This package snapshot does not include a README.'}
                </p>
              )}
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

function PackageDetailPage({ setHeaderSearchSlot }: PackageDetailPageProps) {
  const { namespace, packageId } = useParams()
  const { catalog, isLoading, registryBaseUrl, githubRepositoryUrl } = useRegistryCatalog()

  useEffect(() => {
    setHeaderSearchSlot(null)
    return () => {
      setHeaderSearchSlot(null)
    }
  }, [setHeaderSearchSlot])

  const namespaceValue = namespace ?? ''
  const packageIdValue = packageId ?? ''
  const catalogPackage =
    catalog && namespaceValue && packageIdValue
      ? findRegistryPackage(catalog, namespaceValue, packageIdValue)
      : undefined

  if (!namespaceValue || !packageIdValue) {
    return <PackageSiteNotFound />
  }

  if (isLoading && !catalog) {
    return (
      <div className="py-5">
        <Container>
          <section className="py-5 d-flex justify-content-center" aria-busy="true" aria-label="Loading package">
            <FontAwesomeIcon
              icon={faDuotoneSpinner}
              spinPulse
              size="3x"
              className="text-body-secondary catalog-loading-spinner"
              aria-hidden="true"
            />
          </section>
        </Container>
      </div>
    )
  }

  if (!catalogPackage) {
    return <PackageSiteNotFound />
  }

  return (
    <PackageDetailLoaded
      key={`${catalogPackage.namespace}/${catalogPackage.package}/${catalogPackage.latest}`}
      catalogPackage={catalogPackage}
      registryBaseUrl={registryBaseUrl}
      githubRepositoryUrl={githubRepositoryUrl}
    />
  )
}

export default PackageDetailPage
