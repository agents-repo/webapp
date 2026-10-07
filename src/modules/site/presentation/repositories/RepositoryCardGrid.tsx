import { Col, Row } from 'react-bootstrap'
import MotionReveal from '../../application/motion/MotionReveal'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'
import RepositoryCard from './RepositoryCard.tsx'

interface RepositoryCardGridProps {
  readonly entries: readonly RepositoryManifestEntry[]
}

function RepositoryCardGrid({ entries }: RepositoryCardGridProps) {
  return (
    <Row className="g-4">
      {entries.map((entry, index) => (
        <Col key={entry.slug} md={6} lg={4}>
          <MotionReveal className="h-100" delayMs={Math.min(index, 8) * 50}>
            <RepositoryCard entry={entry} />
          </MotionReveal>
        </Col>
      ))}
    </Row>
  )
}

export default RepositoryCardGrid
