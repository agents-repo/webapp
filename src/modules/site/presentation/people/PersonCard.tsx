import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Card } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink.ts'
import { getRepositoryDetailPath } from '../../application/nestedSiteRoutes.ts'
import {
  GITHUB_AVATAR_SIZE_PX,
  githubAvatarUrl,
  githubProfileUrl,
} from '../../application/people/githubPersonUrls.ts'
import type { PersonEntry } from '../../application/people/peopleManifest.types.ts'
import { getRepositoryBySlug } from '../../application/repositories/repositoryManifest.ts'

interface PersonCardProps {
  readonly person: PersonEntry
}

function PersonCard({ person }: PersonCardProps) {
  const profileUrl = githubProfileUrl(person.githubLogin)
  const avatarUrl = githubAvatarUrl(person.githubLogin)

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column text-center">
        <div className="mb-3">
          <img
            src={avatarUrl}
            alt={person.displayName}
            width={GITHUB_AVATAR_SIZE_PX}
            height={GITHUB_AVATAR_SIZE_PX}
            className="rounded-circle person-card-avatar mb-3"
          />
          <Card.Title as="h3" className="h5">{person.displayName}</Card.Title>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={externalLinkAccessibleName(`${person.displayName} on GitHub`)}
          >
            <FontAwesomeIcon icon={faGithub} className="me-2" aria-hidden="true" />
            GitHub
          </a>
        </div>
        <div className="d-flex flex-wrap gap-1 mt-auto justify-content-center">
          {person.projects.map((project) => {
            const repository = getRepositoryBySlug(project.repositorySlug)
            if (!repository) {
              return null
            }

            return (
              <Badge
                key={`${project.repositorySlug}-${project.role}`}
                as={NavLink}
                to={getRepositoryDetailPath(project.repositorySlug)}
                bg="light"
                text="dark"
                className="fw-normal text-decoration-none"
              >
                {repository.name} · {project.role}
              </Badge>
            )
          })}
        </div>
      </Card.Body>
    </Card>
  )
}

export default PersonCard
