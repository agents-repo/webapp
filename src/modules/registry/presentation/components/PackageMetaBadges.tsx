import type { ReactNode } from 'react'
import { Badge, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { RegistryPackage } from '../../domain/package'

export type PackageMetaBadgeFacet = 'category' | 'tag'

function getFacetBadgeTone(facet: PackageMetaBadgeFacet, selected: boolean) {
  if (selected) {
    return { bg: 'primary' as const, text: undefined, pill: facet === 'tag' }
  }

  if (facet === 'tag') {
    return { bg: 'light' as const, text: 'dark' as const, pill: true }
  }

  return { bg: 'secondary' as const, text: undefined, pill: false }
}

function FacetBadge(options: {
  readonly facet: PackageMetaBadgeFacet
  readonly value: string
  readonly selected: boolean
  readonly onToggleFacet?: (facet: PackageMetaBadgeFacet, value: string) => void
  readonly getFacetHref?: (facet: PackageMetaBadgeFacet, value: string) => string
}): ReactNode {
  const { facet, value, selected, onToggleFacet, getFacetHref } = options
  const label = facet === 'tag' ? `#${value}` : value
  const tone = getFacetBadgeTone(facet, selected && Boolean(onToggleFacet))

  if (onToggleFacet) {
    return (
      <Badge
        as="button"
        type="button"
        bg={tone.bg}
        text={tone.text}
        pill={tone.pill}
        className="border-0 fw-normal"
        aria-pressed={selected}
        aria-label={facet === 'tag' ? `Toggle tag filter ${value}` : `Toggle category filter ${value}`}
        onClick={() => onToggleFacet(facet, value)}
      >
        {label}
      </Badge>
    )
  }

  if (getFacetHref) {
    return (
      <Badge
        as={Link}
        to={getFacetHref(facet, value)}
        bg={tone.bg}
        text={tone.text}
        pill={tone.pill}
        className="fw-normal text-decoration-none"
        aria-label={facet === 'tag' ? `Packages tagged ${value}` : `Packages in category ${value}`}
      >
        {label}
      </Badge>
    )
  }

  return (
    <Badge bg={tone.bg} text={tone.text} pill={tone.pill} className="fw-normal">
      {label}
    </Badge>
  )
}

export function PackageMetaBadges(options: {
  readonly pkg: RegistryPackage
  readonly className?: string
  readonly onToggleFacet?: (facet: PackageMetaBadgeFacet, value: string) => void
  readonly isFacetSelected?: (facet: PackageMetaBadgeFacet, value: string) => boolean
  readonly getFacetHref?: (facet: PackageMetaBadgeFacet, value: string) => string
}): ReactNode {
  const { pkg, className, onToggleFacet, isFacetSelected, getFacetHref } = options

  return (
    <Stack direction="horizontal" gap={2} className={className ?? 'flex-wrap'}>
      <Badge bg="primary">v{pkg.latest}</Badge>
      <FacetBadge
        facet="category"
        value={pkg.category}
        selected={isFacetSelected?.('category', pkg.category) ?? false}
        onToggleFacet={onToggleFacet}
        getFacetHref={getFacetHref}
      />
      <Badge bg="info" text="dark">
        {pkg.estimateOverallCost.band} cost
      </Badge>
      {pkg.tags.map((tag) => (
        <FacetBadge
          key={tag}
          facet="tag"
          value={tag}
          selected={isFacetSelected?.('tag', tag) ?? false}
          onToggleFacet={onToggleFacet}
          getFacetHref={getFacetHref}
        />
      ))}
    </Stack>
  )
}
