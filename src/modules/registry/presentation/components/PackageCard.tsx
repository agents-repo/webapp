import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faEye, faFilter } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Card, Col, Dropdown, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatRegistryPackageRef, toPackageSlug, type RegistryPackage } from '../../domain/package'
import { getNamespacePackagesPath, getPackageDetailPath } from '../../application/packageSiteRoutes'
import { useLocalizedSitePath } from '../../../site/application/i18n/useLocalizedSitePath.ts'
import { getPackageDownloadStats } from '../../application/packageDownloadStats'
import { getPackageDownloadTargets } from '../pages/homePageCatalogState'
import { useRegistryCatalog } from '../catalog/registryCatalogContext'
import { PackageDownloadStatsSummary } from './PackageDownloadStatsSummary'
import PackageCliInstallAction from './PackageCliInstallAction'
import { PackageDownloadMenu } from './PackageDownloadMenu'
import { PackageMetaBadges } from './PackageMetaBadges'
import { PackageStatusBadge } from './PackageStatusBadge'
import PackageUseInChatAction from './PackageUseInChatAction'

export interface PackageCardProps {
  readonly pkg: RegistryPackage
  readonly registryBaseUrl: string
  readonly onFilterByOwner: (owner: string) => void
  readonly onToggleFacet?: (facet: 'category' | 'tag', value: string) => void
  readonly isFacetSelected?: (facet: 'category' | 'tag', value: string) => boolean
}

export function PackageCard({
  pkg,
  registryBaseUrl,
  onFilterByOwner,
  onToggleFacet,
  isFacetSelected,
}: PackageCardProps) {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const { downloadStatsById } = useRegistryCatalog()
  const packageSlug = toPackageSlug(pkg.namespace, pkg.package)
  const downloadTargets = getPackageDownloadTargets(pkg, registryBaseUrl)
  const detailPath = localizedSitePath(getPackageDetailPath(pkg.namespace, pkg.package))
  const namespacePath = localizedSitePath(getNamespacePackagesPath(pkg.namespace))
  const cliPackageRef = formatRegistryPackageRef(pkg.namespace, pkg.package)
  const showCli = cliPackageRef !== null
  const showUseInChat = pkg.chatWeb === true

  return (
    <Col>
      <Card id={`package-card-${packageSlug}`} className="h-100 d-flex flex-column border-secondary-subtle package-card">
        <Card.Header className="p-3 p-lg-4">
          <Stack direction="horizontal" className="justify-content-between align-items-start">
            <div className="me-2">
              <Card.Title as="h3" className="h6 fw-semibold mb-0 lh-sm">
                <Link to={detailPath} className="package-card-title-link stretched-link-none">
                  {pkg.name}
                </Link>
              </Card.Title>
              <Card.Subtitle as="div" className="small text-body-secondary mb-0 mt-1">
                {t('packageCard.byOwner')}{' '}
                <Dropdown as="div" align="end" className="d-inline-block">
                  <Dropdown.Toggle
                    as="button"
                    id={`owner-actions-${packageSlug}`}
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
                      aria-label={t('packageCard.viewGitHubProfileAriaLabel', { owner: pkg.owner })}
                    >
                      <FontAwesomeIcon icon={faGithub} className="me-2" aria-hidden="true" />
                      {t('packageCard.viewGitHubProfile')}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to={namespacePath}>
                      <FontAwesomeIcon icon={faFilter} className="me-2" aria-hidden="true" />
                      {t('packageCard.viewPackagesInNamespace')}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => onFilterByOwner(pkg.owner)}>
                      <FontAwesomeIcon icon={faFilter} className="me-2" aria-hidden="true" />
                      {t('packageCard.filterByOwner')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Subtitle>
            </div>
            <div className="d-flex flex-column align-items-center text-center flex-shrink-0">
              <PackageStatusBadge status={pkg.status} />
              <PackageDownloadStatsSummary
                stats={getPackageDownloadStats(downloadStatsById, pkg.namespace, pkg.package)}
                packageName={pkg.name}
                variant="card"
                controlId={packageSlug}
              />
            </div>
          </Stack>
        </Card.Header>

        <Card.Body className="d-flex flex-column flex-grow-1 gap-3 p-3 p-lg-4">
          <Card.Text as="p" className="small text-body-secondary mb-0 package-description">
            {pkg.description}
          </Card.Text>
          <PackageMetaBadges pkg={pkg} onToggleFacet={onToggleFacet} isFacetSelected={isFacetSelected} />
        </Card.Body>

        <Card.Footer className="d-flex justify-content-center gap-2 flex-wrap flex-md-nowrap">
          {showCli ? (
            <PackageCliInstallAction
              packageName={pkg.name}
              packageId={cliPackageRef}
              controlId={packageSlug}
            />
          ) : null}
          {showUseInChat ? (
            <PackageUseInChatAction
              packageName={pkg.name}
              namespace={pkg.namespace}
              packageId={pkg.package}
              latest={pkg.latest}
              registryBaseUrl={registryBaseUrl}
              controlId={packageSlug}
              quickstart={pkg.quickstart}
            />
          ) : null}
          <PackageDownloadMenu
            packageName={pkg.name}
            controlId={`download-actions-${packageSlug}`}
            downloadTargets={downloadTargets}
          />
          <Link
            to={detailPath}
            className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center package-card-action"
            aria-label={t('packageCard.viewAriaLabel', { name: pkg.name })}
          >
            <FontAwesomeIcon icon={faEye} aria-hidden="true" />
            <span className="package-card-action-label">{t('packageCard.view')}</span>
          </Link>
        </Card.Footer>
      </Card>
    </Col>
  )
}
