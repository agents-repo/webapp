import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import { Badge } from 'react-bootstrap'
import type { PackageStatus } from '../../domain/package'

const PACKAGE_STATUS_BADGE: Record<PackageStatus, { bg: string; icon: typeof faCircleCheck }> = {
  active: { bg: 'success', icon: faCircleCheck },
  deprecated: { bg: 'warning', icon: faClock },
  archived: { bg: 'secondary', icon: faClock },
  yanked: { bg: 'danger', icon: faClock },
}

export function PackageStatusBadge({ status }: { readonly status: PackageStatus }) {
  const statusBadge = PACKAGE_STATUS_BADGE[status]

  return (
    <Badge bg={statusBadge.bg}>
      <FontAwesomeIcon icon={statusBadge.icon} className="me-1" aria-hidden="true" />
      {status}
    </Badge>
  )
}
