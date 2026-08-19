import type { ReactNode } from 'react'
import { Accordion, Badge, Button, Form, Stack } from 'react-bootstrap'
import {
  facetOptionCount,
  getSelectedPackageCatalogFilterChips,
  packageCatalogFilterIncludes,
  packageCatalogFiltersAreActive,
  type PackageCatalogFacetOption,
  type PackageCatalogFacets,
  type PackageCatalogFilterFacet,
  type PackageCatalogFilters,
  type PackageCatalogPopularChip,
  type PackageCatalogSelectedChip,
} from '../../application/packageCatalogFilters'
import {
  getPackageCatalogFacetGroupLabel,
  getPackageCatalogFacetValueLabel,
  toPackageCatalogFilterControlId,
} from './packageCatalogFilterUi'

function FacetOptions(options: {
  readonly idPrefix: string
  readonly facet: Exclude<PackageCatalogFilterFacet, 'chatWeb'>
  readonly facetOptions: readonly PackageCatalogFacetOption[]
  readonly selected: readonly string[]
  readonly onToggle: (facet: PackageCatalogFilterFacet, value?: string) => void
}): ReactNode {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="visually-hidden">{getPackageCatalogFacetGroupLabel(options.facet)}</legend>
      <Stack gap={2}>
        {options.facetOptions.map((option) => {
          const controlId = toPackageCatalogFilterControlId(options.idPrefix, options.facet, option.value)
          const label = getPackageCatalogFacetValueLabel(options.facet, option.value)
          return (
            <Form.Check
              key={option.value}
              type="checkbox"
              id={controlId}
              label={`${label} (${option.count})`}
              checked={packageCatalogFilterIncludes(options.selected, option.value)}
              onChange={() => options.onToggle(options.facet, option.value)}
            />
          )
        })}
      </Stack>
    </fieldset>
  )
}

export function PackageCatalogFilterBody(options: {
  readonly idPrefix: string
  readonly facets: PackageCatalogFacets
  readonly filters: PackageCatalogFilters
  readonly onToggle: (facet: PackageCatalogFilterFacet, value?: string) => void
}): ReactNode {
  const { idPrefix, facets, filters, onToggle } = options
  const chatWebId = toPackageCatalogFilterControlId(idPrefix, 'chatWeb', '1')

  return (
    <Accordion id={`${idPrefix}-package-catalog-filters`} defaultActiveKey={['category']} alwaysOpen flush>
      <Accordion.Item eventKey="category">
        <Accordion.Header>{getPackageCatalogFacetGroupLabel('category')}</Accordion.Header>
        <Accordion.Body>
          <FacetOptions
            idPrefix={idPrefix}
            facet="category"
            facetOptions={facets.categories}
            selected={filters.categories}
            onToggle={onToggle}
          />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="tag">
        <Accordion.Header>{getPackageCatalogFacetGroupLabel('tag')}</Accordion.Header>
        <Accordion.Body>
          <FacetOptions
            idPrefix={idPrefix}
            facet="tag"
            facetOptions={facets.tags}
            selected={filters.tags}
            onToggle={onToggle}
          />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="target">
        <Accordion.Header>{getPackageCatalogFacetGroupLabel('target')}</Accordion.Header>
        <Accordion.Body>
          <FacetOptions
            idPrefix={idPrefix}
            facet="target"
            facetOptions={facets.targets}
            selected={filters.targets}
            onToggle={onToggle}
          />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="status">
        <Accordion.Header>{getPackageCatalogFacetGroupLabel('status')}</Accordion.Header>
        <Accordion.Body>
          <FacetOptions
            idPrefix={idPrefix}
            facet="status"
            facetOptions={facets.statuses}
            selected={filters.statuses}
            onToggle={onToggle}
          />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="cost">
        <Accordion.Header>{getPackageCatalogFacetGroupLabel('cost')}</Accordion.Header>
        <Accordion.Body>
          <FacetOptions
            idPrefix={idPrefix}
            facet="cost"
            facetOptions={facets.costBands}
            selected={filters.costBands}
            onToggle={onToggle}
          />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="chatWeb">
        <Accordion.Header>{getPackageCatalogFacetGroupLabel('chatWeb')}</Accordion.Header>
        <Accordion.Body>
          <fieldset className="border-0 p-0 m-0">
            <legend className="visually-hidden">Use in chat</legend>
            <Form.Check
              type="checkbox"
              id={chatWebId}
              label={`Use in chat (${facets.chatWebCount})`}
              checked={filters.chatWebOnly}
              onChange={() => onToggle('chatWeb')}
            />
          </fieldset>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

function isPopularChipSelected(
  chip: PackageCatalogPopularChip,
  filters: PackageCatalogFilters,
): boolean {
  if (chip.facet === 'category') {
    return packageCatalogFilterIncludes(filters.categories, chip.value)
  }

  return packageCatalogFilterIncludes(filters.tags, chip.value)
}

function selectedChipKey(chip: PackageCatalogSelectedChip): string {
  return `${chip.facet}:${chip.value}`
}

function popularChipKey(chip: PackageCatalogPopularChip): string {
  return `${chip.facet}:${chip.value}`
}

export function PackageCatalogFilterChips(options: {
  readonly popularChips: readonly PackageCatalogPopularChip[]
  readonly facets: PackageCatalogFacets
  readonly filters: PackageCatalogFilters
  readonly onToggle: (facet: PackageCatalogFilterFacet, value?: string) => void
  readonly onClear: () => void
}): ReactNode {
  const { popularChips, facets, filters, onToggle, onClear } = options
  const popularKeys = new Set(popularChips.map(popularChipKey))
  const extraSelectedChips = getSelectedPackageCatalogFilterChips(filters).filter((chip) => {
    if (chip.facet === 'category' || chip.facet === 'tag') {
      return !popularKeys.has(selectedChipKey(chip))
    }

    return true
  })
  const showClear = packageCatalogFiltersAreActive(filters)

  return (
    <Stack gap={2} className="mb-3">
      {popularChips.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="small text-body-secondary me-1">Popular</span>
          {popularChips.map((chip) => {
            const selected = isPopularChipSelected(chip, filters)
            const optionsForFacet = chip.facet === 'category' ? facets.categories : facets.tags
            const count = facetOptionCount(optionsForFacet, chip.value)
            const label = getPackageCatalogFacetValueLabel(chip.facet, chip.value)
            return (
              <Button
                key={popularChipKey(chip)}
                type="button"
                size="sm"
                variant={selected ? 'primary' : 'outline-secondary'}
                className={chip.facet === 'tag' ? 'rounded-pill' : undefined}
                aria-pressed={selected}
                onClick={() => onToggle(chip.facet, chip.value)}
              >
                {label} ({count})
              </Button>
            )
          })}
        </div>
      ) : null}

      {extraSelectedChips.length > 0 || showClear ? (
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {extraSelectedChips.map((chip) => (
            <Badge
              key={selectedChipKey(chip)}
              as="button"
              type="button"
              bg="secondary"
              className="border-0"
              onClick={() => onToggle(chip.facet, chip.value)}
              aria-label={`Remove ${getPackageCatalogFacetValueLabel(chip.facet, chip.value)} filter`}
            >
              {getPackageCatalogFacetValueLabel(chip.facet, chip.value)} ×
            </Badge>
          ))}
          {showClear ? (
            <Button type="button" variant="link" size="sm" className="px-1" onClick={onClear}>
              Clear all
            </Button>
          ) : null}
        </div>
      ) : null}
    </Stack>
  )
}
