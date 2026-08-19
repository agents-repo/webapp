import { Badge, Card } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'
import { getRepositoryDetailPath } from '../../application/nestedSiteRoutes.ts'
import { publicSitePath } from '../routes/siteRoutes.ts'

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
  return (
    <Card className="h-100 position-relative">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <Card.Title className="h5 mb-0">{entry.name}</Card.Title>
          <Badge bg={roleBadgeVariant(entry.role)} className="text-uppercase">
            {entry.role}
          </Badge>
        </div>
        <Card.Text className="text-body-secondary flex-grow-1">{entry.description}</Card.Text>
        <div className="d-flex flex-wrap gap-1 mb-3">
          {entry.tags.map((tag) => (
            <Badge key={tag} bg="light" text="dark" className="fw-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <NavLink to={publicSitePath(getRepositoryDetailPath(entry.slug))} className="stretched-link">
          View {entry.name} repository page
        </NavLink>
      </Card.Body>
    </Card>
  )
}

export default RepositoryCard
