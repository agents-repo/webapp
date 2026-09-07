import { useEffect, useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLink, faLanguage } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Alert, Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { NavLink, useParams } from 'react-router-dom'
import { buildGoogleTranslateUrl, shouldShowGoogleTranslate } from '../../../site/application/i18n/googleTranslate.ts'
import { useLocale } from '../../../site/application/i18n/useLocale.ts'
import { useLocalizedSitePath } from '../../../site/application/i18n/useLocalizedSitePath.ts'
import { isSafeExternalHttpUrl } from '../../../site/application/urlSafety'
import { useExternalLinkAccessibleName } from '../../../site/application/accessibility/useExternalLinkAccessibleName'
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
import { getPackageDownloadStats } from '../../application/packageDownloadStats'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageDownloadStatsSummary } from '../components/PackageDownloadStatsSummary'
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
  const { t } = useTranslation('catalog')
  const externalLinkName = useExternalLinkAccessibleName()
  const localizedSitePath = useLocalizedSitePath()
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
        {t('packageDetail.byOwner')}{' '}
        <NavLink to={localizedSitePath(getNamespacePackagesPath(catalogPackage.namespace))}>{catalogPackage.owner}</NavLink>
      </p>
      <p className="mb-3">{catalogPackage.description}</p>
      <PackageMetaBadges
        pkg={catalogPackage}
        className="flex-wrap mb-3"
        getFacetHref={(facet, value) => localizedSitePath(getPackageCatalogFacetQueryPath(facet, value))}
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
            aria-label={externalLinkName(t('packageDetail.viewOnGitHubAriaLabel', { name: catalogPackage.name }))}
          >
            <FontAwesomeIcon icon={faGithub} aria-hidden="true" />
            <span className="package-card-action-label">{t('packageDetail.viewOnGitHub')}</span>
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
  const { t } = useTranslation('catalog')
  const externalLinkName = useExternalLinkAccessibleName()

  return (
    <a
      href={homepage}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={externalLinkName(t('packageDetail.homepageAriaLabel'))}
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
  const { t } = useTranslation('catalog')
  const metadata = options.detail?.metadata
  const homepage = getSafeHomepage(metadata?.homepage)
  const maintainers = metadata?.maintainers ?? []
  const installTargets = options.catalogPackage.installTargets ?? []
  const license = metadata?.license

  return (
    <Card className="flex-fill w-100 border-secondary-subtle">
      <Card.Body>
        <h2 className="h4">{t('packageDetail.metadataHeading')}</h2>
        <dl className="row mb-0 small">
          {license ? <MetadataRow term={t('packageDetail.license')}>{license}</MetadataRow> : null}
          {homepage ? (
            <MetadataRow term={t('packageDetail.homepage')}>
              <PackageHomepageLink homepage={homepage} />
            </MetadataRow>
          ) : null}
          {maintainers.length > 0 ? (
            <MetadataRow term={t('packageDetail.maintainers')}>{maintainers.join(', ')}</MetadataRow>
          ) : null}
          {installTargets.length > 0 ? (
            <MetadataRow term={t('packageDetail.installTargets')}>
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
  const { t } = useTranslation('catalog')
  const { detail, isDetailLoading } = options

  return (
    <Card className="flex-fill w-100 border-secondary-subtle">
      <Card.Body>
        <h2 className="h4">{t('packageDetail.versionsHeading')}</h2>
        {detail?.versions.entries.length ? (
          <ul className="mb-0">
            {detail.versions.entries.map((entry) => (
              <li key={entry.version}>
                <strong>{entry.version}</strong>
                {entry.version === detail.versions.latest ? ` ${t('packageDetail.latestSuffix')}` : ''}
                <span className="text-body-secondary">
                  {' '}
                  · {t('packageDetail.artifactsCount', { count: entry.artifacts.length })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-0 text-body-secondary">
            {isDetailLoading ? t('packageDetail.loadingVersions') : t('packageDetail.noVersions')}
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
  const { locale } = useLocale()
  const localizedSitePath = useLocalizedSitePath()
  const { t: tShell } = useTranslation('shell')
  const { t } = useTranslation('catalog')
  const { downloadStatsById } = useRegistryCatalog()
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

        setDetailError(error instanceof Error ? error.message : t('packageDetail.detailLoadError'))
        setSettledRequestKey(detailRequestKey)
      })

    return () => {
      isActive = false
      abortController.abort()
    }
  }, [catalogPackage, detailRequestKey, registryBaseUrl, t])

  return (
    <div className="py-4 py-lg-5">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-3 package-detail-breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <NavLink to={localizedSitePath(getPackagesIndexPath())}>{t('packagesIndex.title')}</NavLink>
            </li>
            <li className="breadcrumb-item">
              <NavLink to={localizedSitePath(getNamespacePackagesPath(catalogPackage.namespace))}>
                {catalogPackage.namespace}
              </NavLink>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {catalogPackage.name}
            </li>
          </ol>
        </nav>

        <Stack gap={4}>
          {shouldShowGoogleTranslate(locale) ? (
            <div>
              <a
                href={buildGoogleTranslateUrl(globalThis.location.href, locale)}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
              >
                <FontAwesomeIcon icon={faLanguage} aria-hidden="true" />
                {tShell('footer.translateWithGoogle')}
              </a>
            </div>
          ) : null}

          <PackageDetailHeader
            catalogPackage={catalogPackage}
            registryBaseUrl={registryBaseUrl}
            githubRepositoryUrl={githubRepositoryUrl}
          />

          <Row className="g-3">
            <Col md={6} className="d-flex">
              <PackageDetailMetadataCard catalogPackage={catalogPackage} detail={detail} />
            </Col>
            <Col md={6} className="d-flex">
              <Row className="g-3 flex-fill w-100">
                <Col xs={12} md={6} className="d-flex">
                  <PackageDetailVersionsCard detail={detail} isDetailLoading={isDetailLoading} />
                </Col>
                <Col xs={12} md={6} className="d-flex">
                  <Card className="flex-fill w-100 border-secondary-subtle">
                    <Card.Body>
                      <PackageDownloadStatsSummary
                        stats={getPackageDownloadStats(
                          downloadStatsById,
                          catalogPackage.namespace,
                          catalogPackage.package,
                        )}
                        packageName={catalogPackage.name}
                        variant="detail"
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {visibleDetailError ? <Alert variant="warning">{visibleDetailError}</Alert> : null}

          <Card className="border-secondary-subtle">
            <Card.Body>
              <h2 className="h4">{t('packageDetail.agentsHeading')}</h2>
              <PackageInstructionAccordion
                kind="agent"
                entries={detail?.agents ?? []}
                registryBaseUrl={registryBaseUrl}
              />
            </Card.Body>
          </Card>

          <Card className="border-secondary-subtle">
            <Card.Body>
              <h2 className="h4">{t('packageDetail.flowsHeading')}</h2>
              <PackageInstructionAccordion
                kind="flow"
                entries={detail?.flows ?? []}
                registryBaseUrl={registryBaseUrl}
              />
            </Card.Body>
          </Card>

          <Card className="border-secondary-subtle">
            <Card.Body>
              <h2 className="h4">{t('packageDetail.readmeHeading')}</h2>
              {detail?.readmeMarkdown ? (
                <PackageMarkdown markdown={detail.readmeMarkdown} />
              ) : (
                <p className="mb-0 text-body-secondary">
                  {isDetailLoading ? t('packageDetail.loadingReadme') : t('packageDetail.noReadme')}
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
  const { t } = useTranslation('catalog')
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
          <section className="py-5 d-flex justify-content-center" aria-busy="true" aria-label={t('packageDetail.loadingPackage')}>
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
