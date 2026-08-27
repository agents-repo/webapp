import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  EMPTY_PACKAGE_CATALOG_FILTERS,
  type PackageCatalogFacets,
} from '../../application/packageCatalogFilters'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { PackageCatalogFilterBody } from './PackageCatalogFilters'
import {
  getPackageCatalogFacetGroupLabel,
  getPackageCatalogFilterAccordionActiveKeys,
  toPackageCatalogFilterControlId,
} from './packageCatalogFilterUi'

describe('toPackageCatalogFilterControlId', () => {
  it('builds unique prefixed ids', () => {
    expect(toPackageCatalogFilterControlId('sidebar', 'category', 'agent')).toBe('sidebar-category-agent')
    expect(toPackageCatalogFilterControlId('offcanvas', 'category', 'agent')).toBe(
      'offcanvas-category-agent',
    )
    expect(toPackageCatalogFilterControlId('sidebar', 'target', 'github-copilot')).toBe(
      'sidebar-target-github-copilot',
    )
  })
})

describe('getPackageCatalogFacetGroupLabel', () => {
  it('uses human-readable group names', () => {
    expect(getPackageCatalogFacetGroupLabel('category')).toBe('Category')
    expect(getPackageCatalogFacetGroupLabel('tag')).toBe('Tags')
    expect(getPackageCatalogFacetGroupLabel('target')).toBe('Install targets')
    expect(getPackageCatalogFacetGroupLabel('chatWeb')).toBe('Use in chat')
  })
})

describe('getPackageCatalogFilterAccordionActiveKeys', () => {
  it('keeps category open when no facet is selected', () => {
    expect(getPackageCatalogFilterAccordionActiveKeys(EMPTY_PACKAGE_CATALOG_FILTERS)).toEqual([
      'category',
    ])
  })

  it('adds keys for every selected facet group', () => {
    expect(
      getPackageCatalogFilterAccordionActiveKeys({
        ...EMPTY_PACKAGE_CATALOG_FILTERS,
        tags: ['shared'],
        targets: ['cursor'],
        statuses: ['active'],
        costBands: ['low'],
        chatWebOnly: true,
      }),
    ).toEqual(['category', 'tag', 'target', 'status', 'cost', 'chatWeb'])
  })
})

const stubFacets: PackageCatalogFacets = {
  categories: [{ value: 'automation', count: 1 }],
  tags: [{ value: 'shared', count: 2 }],
  targets: [{ value: 'cursor', count: 1 }],
  statuses: [{ value: 'active', count: 1 }],
  costBands: [{ value: 'low', count: 1 }],
  chatWebCount: 1,
}

describe('PackageCatalogFilterBody', () => {
  it('expands facet groups that already have a selected value', () => {
    renderWithProviders(
      <PackageCatalogFilterBody
        idPrefix="sidebar"
        facets={stubFacets}
        filters={{ ...EMPTY_PACKAGE_CATALOG_FILTERS, tags: ['shared'] }}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Category' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Tags' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Install targets' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
