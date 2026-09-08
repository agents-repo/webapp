import { Badge, Card } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'
import { getRepositoryDetailPath } from '../../application/nestedSiteRoutes.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { useLocalizedRepositoryEntry } from './useLocalizedRepositoryEntry.ts'

interface RepositoryCardProps {
  readonly entry: RepositoryManifestEntry
}

function roleBadgeVariant(role: RepositoryManifestEntry['role']): string {
  switch (role) {
    case 'data':
      return 'primary'
    case 'ui':
      return 'success'
    case 'tooling':
      return 'info'
    case 'infrastructure':
      return 'secondary'
    case 'governance':
      return 'dark'
    default:
      return 'secondary'
  }
}

function RepositoryCard({ entry }: RepositoryCardProps) {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const localized = useLocalizedRepositoryEntry(entry)

  return (
    <Card className="h-100 position-relative">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <Card.Title className="h5 mb-0">{entry.name}</Card.Title>
          <Badge bg={roleBadgeVariant(entry.role)} className="text-uppercase">
            {localized.roleLabel}
          </Badge>
        </div>
        <Card.Text className="text-body-secondary flex-grow-1">{localized.description}</Card.Text>
        <div className="d-flex flex-wrap gap-1 mb-3">
          {entry.tags.map((tag, index) => (
            <Badge key={tag} bg="light" text="dark" className="fw-normal">
              {localized.tags[index]}
            </Badge>
          ))}
        </div>
        <NavLink
          to={localizedSitePath(getRepositoryDetailPath(entry.slug))}
          className="stretched-link"
        >
          {t('repositories.viewRepositoryPage', { name: entry.name })}
        </NavLink>
      </Card.Body>
    </Card>
  )
}

export default RepositoryCard
