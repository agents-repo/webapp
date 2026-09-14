import { Col, Row } from 'react-bootstrap'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'
import RepositoryCard from './RepositoryCard.tsx'

interface RepositoryCardGridProps {
  readonly entries: readonly RepositoryManifestEntry[]
}

function RepositoryCardGrid({ entries }: RepositoryCardGridProps) {
  return (
    <Row className="g-4">
      {entries.map((entry) => (
        <Col key={entry.slug} md={6} lg={4}>
          <RepositoryCard entry={entry} />
        </Col>
      ))}
    </Row>
  )
}

export default RepositoryCardGrid
