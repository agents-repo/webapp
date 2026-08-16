import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faCircleCheck,
  faClock,
  faDownload,
  faEye,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Badge, Card, Col, Dropdown, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatRegistryPackageRef, toPackageSlug, type PackageStatus, type RegistryPackage } from '../../domain/package'
import { getNamespacePackagesPath, getPackageDetailPath } from '../../application/packageSiteRoutes'
import {
  getPackageDownloadTargets,
  type PackageDownloadTarget,
} from '../pages/homePageCatalogState'
import PackageCliInstallAction from './PackageCliInstallAction'
import PackageUseInChatAction from './PackageUseInChatAction'

const PACKAGE_STATUS_BADGE: Record<PackageStatus, { bg: string; icon: typeof faCircleCheck }> = {
  active: { bg: 'success', icon: faCircleCheck },
  deprecated: { bg: 'warning', icon: faClock },
  archived: { bg: 'secondary', icon: faClock },
  yanked: { bg: 'danger', icon: faClock },
}

const renderPackageDownloadAction = (
  pkg: RegistryPackage,
  packageSlug: string,
  downloadTargets: PackageDownloadTarget[],
): ReactNode => (
  <Dropdown align="end">
    <Dropdown.Toggle
      variant="outline-primary"
      id={`download-actions-${packageSlug}`}
      className="d-inline-flex align-items-center justify-content-center package-card-action"
      aria-label={`Download ${pkg.name}`}
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

export interface PackageCardProps {
  readonly pkg: RegistryPackage
  readonly registryBaseUrl: string
  readonly onFilterByOwner: (owner: string) => void
}

export function PackageCard({ pkg, registryBaseUrl, onFilterByOwner }: PackageCardProps) {
  const statusBadge = PACKAGE_STATUS_BADGE[pkg.status]
  const packageSlug = toPackageSlug(pkg.namespace, pkg.package)
  const downloadTargets = getPackageDownloadTargets(pkg, registryBaseUrl)
  const detailPath = getPackageDetailPath(pkg.namespace, pkg.package)
  const namespacePath = getNamespacePackagesPath(pkg.namespace)
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
                by{' '}
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
                      aria-label={`View GitHub profile for ${pkg.owner} (opens in a new tab)`}
                    >
                      <FontAwesomeIcon icon={faGithub} className="me-2" aria-hidden="true" />
                      View GitHub profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to={namespacePath}>
                      <FontAwesomeIcon icon={faFilter} className="me-2" aria-hidden="true" />
                      View packages in this namespace
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => onFilterByOwner(pkg.owner)}>
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
          {downloadTargets.length > 0 ? renderPackageDownloadAction(pkg, packageSlug, downloadTargets) : null}
          <Link
            to={detailPath}
            className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center package-card-action"
            aria-label={`View ${pkg.name}`}
          >
            <FontAwesomeIcon icon={faEye} aria-hidden="true" />
            <span className="package-card-action-label">View</span>
          </Link>
        </Card.Footer>
      </Card>
    </Col>
  )
}
