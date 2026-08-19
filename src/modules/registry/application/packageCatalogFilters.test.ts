import { describe, expect, it } from 'vitest'
import { filterableRegistryCatalog } from '../../../test/fixtures/filterableRegistryCatalog'
import {
  applyPackageCatalogFiltersToSearchParams,
  collectPackageCatalogFacets,
  countSelectedPackageCatalogFacets,
  EMPTY_PACKAGE_CATALOG_FILTERS,
  excludeYankedPackages,
  facetOptionCount,
  filterPackageCatalog,
  getPackageCatalogFacetQueryPath,
  getPopularPackageCatalogChips,
  getSelectedPackageCatalogFilterChips,
  packageCatalogFiltersAreActive,
  parsePackageCatalogFilters,
  togglePackageCatalogFilterValue,
  type PackageCatalogFilters,
} from './packageCatalogFilters'

const listing = filterableRegistryCatalog.packages

const withFilters = (overrides: Partial<PackageCatalogFilters>): PackageCatalogFilters => ({
  ...EMPTY_PACKAGE_CATALOG_FILTERS,
  ...overrides,
})

describe('excludeYankedPackages', () => {
  it('drops yanked packages from listings', () => {
    expect(excludeYankedPackages(listing).map((pkg) => pkg.package)).toEqual([
      'review-agent',
      'plan-flow',
      'legacy-helper',
    ])
  })
})

describe('filterPackageCatalog', () => {
  it('returns non-yanked packages when no filters are set', () => {
    expect(filterPackageCatalog(listing, EMPTY_PACKAGE_CATALOG_FILTERS)).toHaveLength(3)
  })

  it('ignores yanked packages even when status=yanked is requested', () => {
    const filtered = filterPackageCatalog(
      listing,
      withFilters({ statuses: ['yanked'] }),
    )
    expect(filtered).toHaveLength(0)
  })

  it('matches category in the packages-only search index', () => {
    const filtered = filterPackageCatalog(listing, withFilters({ query: 'automation' }))
    expect(filtered.map((pkg) => pkg.package)).toEqual(['review-agent', 'legacy-helper'])
  })

  it('ANDs facets and ORs values within a facet', () => {
    const filtered = filterPackageCatalog(
      listing,
      withFilters({
        categories: ['automation'],
        tags: ['review', 'legacy'],
      }),
    )
    expect(filtered.map((pkg) => pkg.package)).toEqual(['review-agent', 'legacy-helper'])
  })

  it('treats an empty facet as no constraint', () => {
    expect(filterPackageCatalog(listing, withFilters({ categories: [] }))).toHaveLength(3)
  })

  it('requires chat-web only when chatWebOnly is true', () => {
    const filtered = filterPackageCatalog(listing, withFilters({ chatWebOnly: true }))
    expect(filtered.map((pkg) => pkg.package)).toEqual(['review-agent'])
  })

  it('matches install targets when any selected target is present', () => {
    const filtered = filterPackageCatalog(listing, withFilters({ targets: ['cursor'] }))
    expect(filtered.map((pkg) => pkg.package)).toEqual(['review-agent', 'plan-flow'])
  })
})

describe('collectPackageCatalogFacets', () => {
  it('omits yanked values from option lists', () => {
    const facets = collectPackageCatalogFacets(listing, EMPTY_PACKAGE_CATALOG_FILTERS)
    expect(facets.categories.map((option) => option.value)).toEqual(['assistant', 'automation'])
    expect(facets.tags.map((option) => option.value)).not.toContain('withdrawn')
    expect(facets.statuses.map((option) => option.value)).toEqual(['active', 'deprecated'])
  })

  it('uses store-style counts so selecting a tag changes category counts', () => {
    const unfiltered = collectPackageCatalogFacets(listing, EMPTY_PACKAGE_CATALOG_FILTERS)
    expect(facetOptionCount(unfiltered.categories, 'automation')).toBe(2)
    expect(facetOptionCount(unfiltered.categories, 'assistant')).toBe(1)

    const withTag = collectPackageCatalogFacets(listing, withFilters({ tags: ['shared'] }))
    expect(facetOptionCount(withTag.categories, 'automation')).toBe(1)
    expect(facetOptionCount(withTag.categories, 'assistant')).toBe(1)
    expect(facetOptionCount(withTag.categories, 'automation')).not.toBe(
      facetOptionCount(unfiltered.categories, 'automation'),
    )
  })

  it('keeps zero-count options visible', () => {
    const facets = collectPackageCatalogFacets(listing, withFilters({ tags: ['legacy'] }))
    expect(facets.categories).toEqual([
      { value: 'assistant', count: 0 },
      { value: 'automation', count: 1 },
    ])
  })
})

describe('getPopularPackageCatalogChips', () => {
  it('ranks category and tag chips by scoped frequency and keeps them distinct', () => {
    const chips = getPopularPackageCatalogChips(listing)
    expect(chips[0]).toEqual({ facet: 'category', value: 'automation', frequency: 2 })
    expect(chips).toContainEqual({ facet: 'tag', value: 'shared', frequency: 2 })
    expect(chips.some((chip) => chip.facet === 'category' && chip.value === 'humor')).toBe(false)
  })
})

describe('parsePackageCatalogFilters and applyPackageCatalogFiltersToSearchParams', () => {
  it('round-trips known params and leaves unknown keys', () => {
    const input = new URLSearchParams(
      'q=review&category=automation&tag=shared&target=cursor&status=active&cost=low&chatWeb=1&utm=keep',
    )
    const filters = parsePackageCatalogFilters(input)
    expect(filters).toEqual({
      query: 'review',
      categories: ['automation'],
      tags: ['shared'],
      targets: ['cursor'],
      statuses: ['active'],
      costBands: ['low'],
      chatWebOnly: true,
    })

    const serialized = applyPackageCatalogFiltersToSearchParams(input, filters)
    expect(serialized.get('utm')).toBe('keep')
    expect(serialized.get('chatWeb')).toBe('1')
    expect(serialized.getAll('category')).toEqual(['automation'])
  })

  it('ignores yanked status values and non-1 chatWeb values', () => {
    const filters = parsePackageCatalogFilters(new URLSearchParams('status=yanked&status=active&chatWeb=0'))
    expect(filters.statuses).toEqual(['active'])
    expect(filters.chatWebOnly).toBe(false)
  })

  it('keeps stale unknown facet values selected', () => {
    const filters = parsePackageCatalogFilters(new URLSearchParams('category=missing-category'))
    expect(filters.categories).toEqual(['missing-category'])
    expect(filterPackageCatalog(listing, filters)).toHaveLength(0)
  })

  it('clears only known catalog params', () => {
    const serialized = applyPackageCatalogFiltersToSearchParams(
      new URLSearchParams('q=review&category=automation&utm=keep'),
      EMPTY_PACKAGE_CATALOG_FILTERS,
    )
    expect(serialized.toString()).toBe('utm=keep')
  })
})

describe('toggle and selection helpers', () => {
  it('toggles values case-insensitively', () => {
    expect(togglePackageCatalogFilterValue(['automation'], 'Automation')).toEqual([])
    expect(togglePackageCatalogFilterValue([], 'Review')).toEqual(['review'])
  })

  it('counts selected facets without the search query', () => {
    const filters = withFilters({
      query: 'lots-of-characters',
      categories: ['automation'],
      tags: ['shared'],
      chatWebOnly: true,
    })
    expect(countSelectedPackageCatalogFacets(filters)).toBe(3)
    expect(packageCatalogFiltersAreActive(filters)).toBe(true)
    expect(packageCatalogFiltersAreActive(withFilters({ query: 'review' }))).toBe(true)
    expect(packageCatalogFiltersAreActive(EMPTY_PACKAGE_CATALOG_FILTERS)).toBe(false)
  })

  it('lists selected chips with distinct category and tag identities', () => {
    const chips = getSelectedPackageCatalogFilterChips(
      withFilters({ categories: ['automation'], tags: ['automation'] }),
    )
    expect(chips).toEqual([
      { facet: 'category', value: 'automation' },
      { facet: 'tag', value: 'automation' },
    ])
  })

  it('builds packages-index facet query paths', () => {
    expect(getPackageCatalogFacetQueryPath('category', 'Agent')).toBe('/packages?category=agent')
    expect(getPackageCatalogFacetQueryPath('tag', 'shared')).toBe('/packages?tag=shared')
  })
})
