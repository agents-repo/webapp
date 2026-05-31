import type { RegistryCatalog, RegistryPackage } from '../domain/package'

const createSearchIndex = (pkg: RegistryPackage): string => {
  return [pkg.name, pkg.description, pkg.tags.join(' ')].join(' ').toLowerCase()
}

export const filterRegistryPackages = (
  catalog: RegistryCatalog,
  query: string,
): RegistryPackage[] => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return catalog.packages
  }

  return catalog.packages.filter((pkg) =>
    createSearchIndex(pkg).includes(normalizedQuery),
  )
}

export const formatCatalogUpdatedAt = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}
