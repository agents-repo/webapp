import { Card } from 'react-bootstrap'
import ExternalLinkListItem from '../layout/ExternalLinkListItem'

interface RepositoryContactLink {
  readonly href: string
  readonly accessibleLabel: string
  readonly label: string
  readonly suffix: string
}

interface RepositoryContactCardProps {
  readonly heading: string
  readonly body: string
  readonly links: readonly RepositoryContactLink[]
}

function RepositoryContactCard({ heading, body, links }: RepositoryContactCardProps) {
  return (
    <Card className="h-100">
      <Card.Body>
        <h2 className="h4">{heading}</h2>
        <p className="text-body-secondary">{body}</p>
        <ul className="mb-0">
          {links.map((link) => (
            <ExternalLinkListItem
              key={link.href}
              href={link.href}
              accessibleLabel={link.accessibleLabel}
              suffix={link.suffix}
            >
              {link.label}
            </ExternalLinkListItem>
          ))}
        </ul>
      </Card.Body>
    </Card>
  )
}

export default RepositoryContactCard
