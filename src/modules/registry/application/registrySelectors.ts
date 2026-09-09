import { getIntlLocale } from '../../site/application/i18n/getIntlLocale.ts'
import type { RegistryCatalog, RegistryPackage } from '../domain/package'

const createSearchIndex = (pkg: RegistryPackage): string => {
  return [
    pkg.id,
    pkg.namespace,
    `${pkg.namespace}/${pkg.package}`,
    pkg.name,
    pkg.package,
    pkg.description,
    pkg.owner,
    `@${pkg.owner}`,
    pkg.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

export const filterRegistryPackages = (
  catalog: RegistryCatalog,
  query: string,
): RegistryPackage[] => {
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedOwnerQuery = normalizedQuery.startsWith('@')
    ? normalizedQuery.slice(1)
    : normalizedQuery

  if (!normalizedQuery) {
    return catalog.packages
  }

  return catalog.packages.filter((pkg) => {
    const searchIndex = createSearchIndex(pkg)

    if (searchIndex.includes(normalizedQuery)) {
      return true
    }

    return normalizedOwnerQuery !== normalizedQuery && searchIndex.includes(normalizedOwnerQuery)
  })
}

export const formatCatalogUpdatedAt = (value: string, locale?: string): string => {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}
