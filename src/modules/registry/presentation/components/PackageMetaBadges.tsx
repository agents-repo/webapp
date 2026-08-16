import type { ReactNode } from 'react'
import { Badge, Stack } from 'react-bootstrap'
import type { RegistryPackage } from '../../domain/package'

export function PackageMetaBadges(options: {
  readonly pkg: RegistryPackage
  readonly className?: string
}): ReactNode {
  const { pkg, className } = options

  return (
    <Stack direction="horizontal" gap={2} className={className ?? 'flex-wrap'}>
      <Badge bg="primary">v{pkg.latest}</Badge>
      <Badge bg="secondary">{pkg.category}</Badge>
      <Badge bg="info" text="dark">
        {pkg.estimateOverallCost.band} cost
      </Badge>
      {pkg.tags.map((tag) => (
        <Badge key={tag} bg="light" text="dark" pill className="fw-normal">
          #{tag}
        </Badge>
      ))}
    </Stack>
  )
}
