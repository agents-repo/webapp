import { useEffect, useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Alert, Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink, useParams } from 'react-router-dom'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { publicSitePath } from '../../../site/presentation/routes/siteRoutes'
import { externalLinkAccessibleName } from '../../../site/application/accessibility/externalLink'
import {
  findRegistryPackage,
  getNamespacePackagesPath,
  getPackagesIndexPath,
  isPackagePathSegment,
} from '../../application/packageSiteRoutes'
import { getPackageCatalogFacetQueryPath } from '../../application/packageCatalogFilters'
import { shouldAwaitCatalogMembershipRecheck } from '../../application/runtimePackageCatalog'
import { formatRegistryPackageRef, toPackageSlug, type RegistryPackage } from '../../domain/package'
import type { PackageDetailDocument } from '../../domain/packageDetail'
import { loadPackageDetail } from '../../infrastructure/packageDetailRepository'
import { buildRegistryPackageBrowseUrl } from '../../infrastructure/registrySourceUrl'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { useCatalogMembershipRecheck } from '../catalog/useCatalogMembershipRecheck'
import PackageCliInstallAction from '../components/PackageCliInstallAction'
import { PackageDownloadMenu } from '../components/PackageDownloadMenu'
import PackageInstructionAccordion from '../components/PackageInstructionAccordion'
import PackageMarkdown from '../components/PackageMarkdown'
import { PackageMetaBadges } from '../components/PackageMetaBadges'
import { PackageStatusBadge } from '../components/PackageStatusBadge'
import PackageUseInChatAction from '../components/PackageUseInChatAction'
import { faDuotoneSpinner } from './catalogLoadingSpinnerIcon'
import { getPackageDownloadTargets } from './homePageCatalogState'
import PackageSiteNotFound from './PackageSiteNotFound'

interface PackageDetailPageProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function PackageDetailHeader(options: {
  readonly catalogPackage: RegistryPackage
  readonly registryBaseUrl: string
  readonly githubRepositoryUrl: string
}): ReactNode {
  const { catalogPackage, registryBaseUrl, githubRepositoryUrl } = options
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
        <PackageStatusBadge status={catalogPackage.status} />
      </Stack>
      <p className="text-body-secondary mb-2">
        by{' '}
        <NavLink to={publicSitePath(getNamespacePackagesPath(catalogPackage.namespace))}>{catalogPackage.owner}</NavLink>
      </p>
      <p className="mb-3">{catalogPackage.description}</p>
      <PackageMetaBadges
        pkg={catalogPackage}
        className="flex-wrap mb-3"
        getFacetHref={(facet, value) => publicSitePath(getPackageCatalogFacetQueryPath(facet, value))}
      />
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
        <PackageDownloadMenu
          packageName={catalogPackage.name}
          controlId={`download-actions-detail-${packageSlug}`}
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
  const detailRequestKey = `${catalogPackage.namespace}/${catalogPackage.package}/${catalogPackage.latest}::${registryBaseUrl}`
  const [detail, setDetail] = useState<PackageDetailDocument | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [settledRequestKey, setSettledRequestKey] = useState<string | null>(null)
  const isDetailLoading = Boolean(registryBaseUrl) && settledRequestKey !== detailRequestKey
  const visibleDetailError = settledRequestKey === detailRequestKey ? detailError : null

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
          setDetailError(null)
          setSettledRequestKey(detailRequestKey)
        }
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof DOMException && error.name === 'AbortError')) {
          return
        }

        setDetailError(error instanceof Error ? error.message : 'Unable to load package detail.')
        setSettledRequestKey(detailRequestKey)
      })

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [catalogPackage, detailRequestKey, registryBaseUrl])

  return (
    <div className="py-4 py-lg-5">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-3 package-detail-breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <NavLink to={publicSitePath(getPackagesIndexPath())}>Packages</NavLink>
            </li>
            <li className="breadcrumb-item">
              <NavLink to={publicSitePath(getNamespacePackagesPath(catalogPackage.namespace))}>
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

          {visibleDetailError ? <Alert variant="warning">{visibleDetailError}</Alert> : null}

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
  const { catalog, isLoading, hasCompletedForcedReload, registryBaseUrl, githubRepositoryUrl } =
    useRegistryCatalog()

  useEffect(() => {
    setHeaderSearchSlot(null)
    return () => {
      setHeaderSearchSlot(null)
    }
  }, [setHeaderSearchSlot])

  const namespaceValue = namespace ?? ''
  const packageIdValue = packageId ?? ''
  const isValidPackagePath =
    isPackagePathSegment(namespaceValue) && isPackagePathSegment(packageIdValue)
  const catalogPackage =
    catalog && isValidPackagePath
      ? findRegistryPackage(catalog, namespaceValue, packageIdValue)
      : undefined

  useCatalogMembershipRecheck({
    enabled: isValidPackagePath,
    isMember: catalogPackage !== undefined,
  })

  if (!isValidPackagePath) {
    return <PackageSiteNotFound />
  }

  if (
    shouldAwaitCatalogMembershipRecheck({
      catalog,
      isLoading,
      hasCompletedForcedReload,
      isMember: catalogPackage !== undefined,
    })
  ) {
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
