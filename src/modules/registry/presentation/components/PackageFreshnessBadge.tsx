import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { Badge } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import type { PackageFreshnessLabel } from '../../application/packageFreshness'

export function PackageFreshnessBadge({
  freshness,
}: {
  readonly freshness: PackageFreshnessLabel | null
}) {
  const { t } = useTranslation('catalog')

  if (freshness !== 'recentlyUpdated') {
    return null
  }

  return (
    <Badge bg="info">
      <FontAwesomeIcon icon={faClock} className="me-1" aria-hidden="true" />
      {t('packageDetail.recentlyUpdated')}
    </Badge>
  )
}
