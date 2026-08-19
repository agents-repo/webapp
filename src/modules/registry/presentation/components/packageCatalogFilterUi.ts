import { INSTALL_TARGET_IDS, type InstallTargetId } from '../../domain/package'
import { getInstallTargetLabel } from '../../application/installTargets'
import type { PackageCatalogFilterFacet } from '../../application/packageCatalogFilters'

export function toPackageCatalogFilterControlId(
  idPrefix: string,
  facet: string,
  value: string,
): string {
  let token = ''
  for (const char of value.toLowerCase()) {
    const isAlphaNum = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9')
    if (isAlphaNum) {
      token += char
      continue
    }

    if (token.length > 0 && !token.endsWith('-')) {
      token += '-'
    }
  }

  if (token.endsWith('-')) {
    token = token.slice(0, -1)
  }

  return `${idPrefix}-${facet}-${token || 'value'}`
}

function getInstallTargetFacetLabel(value: string): string {
  if ((INSTALL_TARGET_IDS as readonly string[]).includes(value)) {
    return getInstallTargetLabel(value as InstallTargetId)
  }

  return value
}

export function getPackageCatalogFacetGroupLabel(facet: PackageCatalogFilterFacet): string {
  switch (facet) {
    case 'category':
      return 'Category'
    case 'tag':
      return 'Tags'
    case 'target':
      return 'Install targets'
    case 'status':
      return 'Status'
    case 'cost':
      return 'Cost band'
    case 'chatWeb':
      return 'Use in chat'
  }
}

export function getPackageCatalogFacetValueLabel(
  facet: PackageCatalogFilterFacet,
  value: string,
): string {
  switch (facet) {
    case 'tag':
      return `#${value}`
    case 'target':
      return getInstallTargetFacetLabel(value)
    case 'cost':
      return `${value} cost`
    case 'chatWeb':
      return 'Use in chat'
    default:
      return value
  }
}
