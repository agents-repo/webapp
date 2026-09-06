import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Card } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

const CREATOR_GITHUB_URL = 'https://github.com/maiconfz'
const CREATOR_LINKEDIN_URL = 'https://www.linkedin.com/in/maiconfz/'

interface CreatorProfileCardProps {
  readonly heading: string
  readonly bodyPrefix: string
  readonly collaboratorsLink: string
  readonly bodySuffix: string
  readonly communityPath: string
  readonly githubAriaLabel: string
  readonly linkedinAriaLabel: string
  readonly githubLabel: string
  readonly linkedinLabel: string
}

function CreatorProfileCard({
  heading,
  bodyPrefix,
  collaboratorsLink,
  bodySuffix,
  communityPath,
  githubAriaLabel,
  linkedinAriaLabel,
  githubLabel,
  linkedinLabel,
}: CreatorProfileCardProps) {
  return (
    <Card>
      <Card.Body>
        <h2 className="h4">{heading}</h2>
        <p className="text-body-secondary">
          {bodyPrefix}{' '}
          <NavLink to={communityPath}>{collaboratorsLink}</NavLink>
          {bodySuffix}
        </p>
        <div className="d-flex flex-wrap gap-3">
          <a
            href={CREATOR_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={githubAriaLabel}
          >
            <FontAwesomeIcon icon={faGithub} className="me-2" aria-hidden="true" />
            {githubLabel}
          </a>
          <a
            href={CREATOR_LINKEDIN_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={linkedinAriaLabel}
          >
            <FontAwesomeIcon icon={faLinkedin} className="me-2" aria-hidden="true" />
            {linkedinLabel}
          </a>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CreatorProfileCard
