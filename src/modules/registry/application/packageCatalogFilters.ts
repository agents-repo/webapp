import type { RegistryPackage } from '../domain/package'

export const PACKAGE_CATALOG_STATUS_FILTER_VALUES = ['active', 'deprecated', 'archived'] as const
export type PackageCatalogStatusFilter = (typeof PACKAGE_CATALOG_STATUS_FILTER_VALUES)[number]

export type PackageCatalogFilterFacet = 'category' | 'tag' | 'target' | 'status' | 'cost' | 'chatWeb'

export interface PackageCatalogFilters {
  readonly query: string
  readonly categories: readonly string[]
  readonly tags: readonly string[]
  readonly targets: readonly string[]
  readonly statuses: readonly string[]
  readonly costBands: readonly string[]
  readonly chatWebOnly: boolean
}

export interface PackageCatalogFacetOption {
  readonly value: string
  readonly count: number
}

export interface PackageCatalogFacets {
  readonly categories: readonly PackageCatalogFacetOption[]
  readonly tags: readonly PackageCatalogFacetOption[]
  readonly targets: readonly PackageCatalogFacetOption[]
  readonly statuses: readonly PackageCatalogFacetOption[]
  readonly costBands: readonly PackageCatalogFacetOption[]
  readonly chatWebCount: number
}

export interface PackageCatalogPopularChip {
  readonly facet: 'category' | 'tag'
  readonly value: string
  readonly frequency: number
}

export const EMPTY_PACKAGE_CATALOG_FILTERS: PackageCatalogFilters = {
  query: '',
  categories: [],
  tags: [],
  targets: [],
  statuses: [],
  costBands: [],
  chatWebOnly: false,
}

const createPackagesSearchIndex = (pkg: RegistryPackage): string => {
  return [
    pkg.id,
    pkg.namespace,
    `${pkg.namespace}/${pkg.package}`,
    pkg.name,
    pkg.package,
    pkg.description,
    pkg.owner,
    `@${pkg.owner}`,
    pkg.category,
    pkg.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

const normalizeToken = (value: string): string => value.trim().toLowerCase()

const uniqueNormalized = (values: readonly string[]): string[] => {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values) {
    const normalized = normalizeToken(value)
    if (normalized.length === 0 || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    unique.push(normalized)
  }

  return unique
}

const hasToken = (values: readonly string[], token: string): boolean => {
  const normalized = normalizeToken(token)
  return values.some((value) => normalizeToken(value) === normalized)
}

export const excludeYankedPackages = (packages: readonly RegistryPackage[]): RegistryPackage[] => {
  return packages.filter((pkg) => pkg.status !== 'yanked')
}

const matchesQuery = (pkg: RegistryPackage, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return true
  }

  const searchIndex = createPackagesSearchIndex(pkg)
  if (searchIndex.includes(normalizedQuery)) {
    return true
  }

  const normalizedOwnerQuery = normalizedQuery.startsWith('@') ? normalizedQuery.slice(1) : normalizedQuery
  return normalizedOwnerQuery !== normalizedQuery && searchIndex.includes(normalizedOwnerQuery)
}

const matchesSelected = (selected: readonly string[], candidate: string): boolean => {
  if (selected.length === 0) {
    return true
  }

  return hasToken(selected, candidate)
}

const matchesAnySelected = (selected: readonly string[], candidates: readonly string[]): boolean => {
  if (selected.length === 0) {
    return true
  }

  return candidates.some((candidate) => hasToken(selected, candidate))
}

export const packageMatchesCatalogFilters = (
  pkg: RegistryPackage,
  filters: PackageCatalogFilters,
): boolean => {
  if (pkg.status === 'yanked') {
    return false
  }

  if (!matchesQuery(pkg, filters.query)) {
    return false
  }

  if (!matchesSelected(filters.categories, pkg.category)) {
    return false
  }

  if (!matchesAnySelected(filters.tags, pkg.tags)) {
    return false
  }

  const targetIds = (pkg.installTargets ?? []).map((target) => target.id)
  if (!matchesAnySelected(filters.targets, targetIds)) {
    return false
  }

  if (!matchesSelected(filters.statuses, pkg.status)) {
    return false
  }

  if (!matchesSelected(filters.costBands, pkg.estimateOverallCost.band)) {
    return false
  }

  if (filters.chatWebOnly && pkg.chatWeb !== true) {
    return false
  }

  return true
}

export const filterPackageCatalog = (
  packages: readonly RegistryPackage[],
  filters: PackageCatalogFilters,
): RegistryPackage[] => {
  return excludeYankedPackages(packages).filter((pkg) => packageMatchesCatalogFilters(pkg, filters))
}

const omitFacet = (
  filters: PackageCatalogFilters,
  facet: PackageCatalogFilterFacet,
): PackageCatalogFilters => {
  switch (facet) {
    case 'category':
      return { ...filters, categories: [] }
    case 'tag':
      return { ...filters, tags: [] }
    case 'target':
      return { ...filters, targets: [] }
    case 'status':
      return { ...filters, statuses: [] }
    case 'cost':
      return { ...filters, costBands: [] }
    case 'chatWeb':
      return { ...filters, chatWebOnly: false }
  }
}

const compareOptions = (left: PackageCatalogFacetOption, right: PackageCatalogFacetOption): number => {
  return left.value.localeCompare(right.value)
}

const collectValueOptions = (
  listing: readonly RegistryPackage[],
  counted: readonly RegistryPackage[],
  readValues: (pkg: RegistryPackage) => readonly string[],
): PackageCatalogFacetOption[] => {
  const values = uniqueNormalized(listing.flatMap((pkg) => [...readValues(pkg)])).sort((left, right) =>
    left.localeCompare(right),
  )

  return values
    .map((value) => ({
      value,
      count: counted.filter((pkg) => readValues(pkg).some((candidate) => normalizeToken(candidate) === value))
        .length,
    }))
    .sort(compareOptions)
}

export const collectPackageCatalogFacets = (
  packages: readonly RegistryPackage[],
  filters: PackageCatalogFilters,
): PackageCatalogFacets => {
  const listing = excludeYankedPackages(packages)

  const countedFor = (facet: PackageCatalogFilterFacet): RegistryPackage[] => {
    return listing.filter((pkg) => packageMatchesCatalogFilters(pkg, omitFacet(filters, facet)))
  }

  return {
    categories: collectValueOptions(listing, countedFor('category'), (pkg) => [pkg.category]),
    tags: collectValueOptions(listing, countedFor('tag'), (pkg) => pkg.tags),
    targets: collectValueOptions(listing, countedFor('target'), (pkg) =>
      (pkg.installTargets ?? []).map((target) => target.id),
    ),
    statuses: collectValueOptions(listing, countedFor('status'), (pkg) => [pkg.status]).filter((option) =>
      (PACKAGE_CATALOG_STATUS_FILTER_VALUES as readonly string[]).includes(option.value),
    ),
    costBands: collectValueOptions(listing, countedFor('cost'), (pkg) => [pkg.estimateOverallCost.band]),
    chatWebCount: countedFor('chatWeb').filter((pkg) => pkg.chatWeb === true).length,
  }
}

export const getPopularPackageCatalogChips = (
  packages: readonly RegistryPackage[],
  limit = 8,
): PackageCatalogPopularChip[] => {
  const listing = excludeYankedPackages(packages)
  const frequencies = new Map<string, PackageCatalogPopularChip>()

  const add = (facet: 'category' | 'tag', value: string): void => {
    const normalized = normalizeToken(value)
    if (normalized.length === 0) {
      return
    }

    const key = `${facet}:${normalized}`
    const existing = frequencies.get(key)
    if (existing) {
      frequencies.set(key, { ...existing, frequency: existing.frequency + 1 })
      return
    }

    frequencies.set(key, { facet, value: normalized, frequency: 1 })
  }

  for (const pkg of listing) {
    add('category', pkg.category)
    for (const tag of pkg.tags) {
      add('tag', tag)
    }
  }

  return [...frequencies.values()]
    .sort((left, right) => {
      if (right.frequency !== left.frequency) {
        return right.frequency - left.frequency
      }

      const valueOrder = left.value.localeCompare(right.value)
      if (valueOrder !== 0) {
        return valueOrder
      }

      return left.facet.localeCompare(right.facet)
    })
    .slice(0, limit)
}

export const togglePackageCatalogFilterValue = (
  values: readonly string[],
  value: string,
): string[] => {
  const normalized = normalizeToken(value)
  if (normalized.length === 0) {
    return [...values]
  }

  if (hasToken(values, normalized)) {
    return values.filter((entry) => normalizeToken(entry) !== normalized)
  }

  return [...uniqueNormalized(values), normalized]
}

export const countSelectedPackageCatalogFacets = (filters: PackageCatalogFilters): number => {
  return (
    filters.categories.length +
    filters.tags.length +
    filters.targets.length +
    filters.statuses.length +
    filters.costBands.length +
    (filters.chatWebOnly ? 1 : 0)
  )
}

export const packageCatalogFiltersAreActive = (filters: PackageCatalogFilters): boolean => {
  return filters.query.trim().length > 0 || countSelectedPackageCatalogFacets(filters) > 0
}

export const facetOptionCount = (
  options: readonly PackageCatalogFacetOption[],
  value: string,
): number => {
  const normalized = normalizeToken(value)
  return options.find((option) => option.value === normalized)?.count ?? 0
}

export const packageCatalogFilterIncludes = (values: readonly string[], value: string): boolean => {
  return hasToken(values, value)
}

export interface PackageCatalogSelectedChip {
  readonly facet: PackageCatalogFilterFacet
  readonly value: string
}

export const getSelectedPackageCatalogFilterChips = (
  filters: PackageCatalogFilters,
): PackageCatalogSelectedChip[] => {
  const chips: PackageCatalogSelectedChip[] = [
    ...filters.categories.map((value) => ({ facet: 'category' as const, value })),
    ...filters.tags.map((value) => ({ facet: 'tag' as const, value })),
    ...filters.targets.map((value) => ({ facet: 'target' as const, value })),
    ...filters.statuses.map((value) => ({ facet: 'status' as const, value })),
    ...filters.costBands.map((value) => ({ facet: 'cost' as const, value })),
  ]

  if (filters.chatWebOnly) {
    chips.push({ facet: 'chatWeb', value: '1' })
  }

  return chips
}

export const PACKAGE_CATALOG_FILTER_PARAM_KEYS = [
  'q',
  'category',
  'tag',
  'target',
  'status',
  'cost',
  'chatWeb',
] as const

const isKnownFilterParamKey = (key: string): boolean => {
  return (PACKAGE_CATALOG_FILTER_PARAM_KEYS as readonly string[]).includes(key)
}

export const parsePackageCatalogFilters = (searchParams: URLSearchParams): PackageCatalogFilters => {
  return {
    query: (searchParams.get('q') ?? '').trim(),
    categories: uniqueNormalized(searchParams.getAll('category')),
    tags: uniqueNormalized(searchParams.getAll('tag')),
    targets: uniqueNormalized(searchParams.getAll('target')),
    statuses: uniqueNormalized(searchParams.getAll('status')).filter((status) => status !== 'yanked'),
    costBands: uniqueNormalized(searchParams.getAll('cost')),
    chatWebOnly: searchParams.get('chatWeb') === '1',
  }
}

const appendSorted = (params: URLSearchParams, key: string, values: readonly string[]): void => {
  for (const value of uniqueNormalized(values).sort((left, right) => left.localeCompare(right))) {
    params.append(key, value)
  }
}

export const applyPackageCatalogFiltersToSearchParams = (
  searchParams: URLSearchParams,
  filters: PackageCatalogFilters,
): URLSearchParams => {
  const next = new URLSearchParams()

  for (const [key, value] of searchParams.entries()) {
    if (!isKnownFilterParamKey(key)) {
      next.append(key, value)
    }
  }

  const query = filters.query.trim()
  if (query.length > 0) {
    next.set('q', query)
  }

  appendSorted(next, 'category', filters.categories)
  appendSorted(next, 'tag', filters.tags)
  appendSorted(next, 'target', filters.targets)
  appendSorted(next, 'status', filters.statuses.filter((status) => status !== 'yanked'))
  appendSorted(next, 'cost', filters.costBands)

  if (filters.chatWebOnly) {
    next.set('chatWeb', '1')
  }

  return next
}

export const getPackageCatalogFacetQueryPath = (facet: 'category' | 'tag', value: string): string => {
  const params = new URLSearchParams()
  const normalized = normalizeToken(value)
  if (normalized.length > 0) {
    params.set(facet === 'category' ? 'category' : 'tag', normalized)
  }

  const query = params.toString()
  return query.length > 0 ? `/packages?${query}` : '/packages'
}
