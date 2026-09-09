import type { ReactNode } from 'react'
import { Card } from 'react-bootstrap'

interface SiteTextCardProps {
  readonly heading: string
  readonly body: ReactNode
  readonly className?: string
}

function SiteTextCard({ heading, body, className }: SiteTextCardProps) {
  const renderedBody =
    typeof body === 'string' ? <p className="text-body-secondary mb-0">{body}</p> : body

  return (
    <Card className={className}>
      <Card.Body>
        <h2 className="h4">{heading}</h2>
        {renderedBody}
      </Card.Body>
    </Card>
  )
}

export default SiteTextCard
