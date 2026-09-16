import type { RegistryPackage } from '../domain/package'

export const CATALOG_SEARCH_DEBOUNCE_MS = 300

const SNIPPET_RADIUS = 60

export type CatalogSearchMatchField = 'name' | 'description' | 'tag' | 'owner' | 'category'

export interface PackageSearchMatchContext {
  readonly fields: readonly CatalogSearchMatchField[]
  readonly descriptionSnippet?: string
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

function getSearchTerms(normalizedQuery: string): readonly string[] {
  const terms = new Set<string>([normalizedQuery])

  if (normalizedQuery.startsWith('@')) {
    const withoutAt = normalizedQuery.slice(1)
    if (withoutAt.length > 0) {
      terms.add(withoutAt)
      if (withoutAt.includes('/')) {
        for (const segment of withoutAt.split('/')) {
          const trimmed = segment.trim()
          if (trimmed.length > 0) {
            terms.add(trimmed)
          }
        }
      }
    }
    return [...terms]
  }

  if (normalizedQuery.includes('/')) {
    for (const segment of normalizedQuery.split('/')) {
      const trimmed = segment.trim()
      if (trimmed.length > 0) {
        terms.add(trimmed)
      }
    }
  }

  return [...terms]
}

function findFirstMatchingTerm(value: string, terms: readonly string[]): string | null {
  const lower = value.toLowerCase()
  for (const term of terms) {
    if (lower.includes(term)) {
      return term
    }
  }
  return null
}

function fieldMatches(value: string, terms: readonly string[]): boolean {
  const lower = value.toLowerCase()
  return terms.some((term) => lower.includes(term))
}

function buildDescriptionSnippet(description: string, queryLower: string): string {
  const descriptionLower = description.toLowerCase()
  const matchIndex = descriptionLower.indexOf(queryLower)

  if (matchIndex === -1) {
    return description
  }

  const start = Math.max(0, matchIndex - SNIPPET_RADIUS)
  const end = Math.min(description.length, matchIndex + queryLower.length + SNIPPET_RADIUS)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < description.length ? '…' : ''

  return `${prefix}${description.slice(start, end).trim()}${suffix}`
}

export function getPackageSearchMatchContext(
  pkg: RegistryPackage,
  query: string,
): PackageSearchMatchContext | null {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) {
    return null
  }

  const terms = getSearchTerms(normalizedQuery)
  const fields: CatalogSearchMatchField[] = []

  if (fieldMatches(pkg.name, terms) || fieldMatches(pkg.package, terms)) {
    fields.push('name')
  }

  if (fieldMatches(pkg.description, terms)) {
    fields.push('description')
  }

  if (pkg.tags.some((tag) => fieldMatches(tag, terms))) {
    fields.push('tag')
  }

  if (fieldMatches(pkg.owner, terms)) {
    fields.push('owner')
  }

  if (fieldMatches(pkg.category, terms)) {
    fields.push('category')
  }

  if (fields.length === 0) {
    return null
  }

  const descriptionSnippet = fields.includes('description')
    ? buildDescriptionSnippet(
        pkg.description,
        findFirstMatchingTerm(pkg.description, terms) ?? normalizedQuery,
      )
    : undefined

  return { fields, descriptionSnippet }
}

export function buildPackageSearchMatchContextMap(
  packages: readonly RegistryPackage[],
  query: string,
): Map<string, PackageSearchMatchContext> {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) {
    return new Map()
  }

  const matches = new Map<string, PackageSearchMatchContext>()

  for (const pkg of packages) {
    const context = getPackageSearchMatchContext(pkg, normalizedQuery)
    if (context) {
      matches.set(pkg.id, context)
    }
  }

  return matches
}
