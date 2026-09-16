export type PackageCatalogSearchNavigationState = {
  readonly focusPackageCatalogSearch?: true
}

let activePackageCatalogSearchFocusHandoff = false

export function markPackageCatalogSearchFocusHandoff(): void {
  activePackageCatalogSearchFocusHandoff = true
}

export function hasActivePackageCatalogSearchFocusHandoff(): boolean {
  return activePackageCatalogSearchFocusHandoff
}

export function completePackageCatalogSearchFocusHandoff(): void {
  activePackageCatalogSearchFocusHandoff = false
}

export function withPackageCatalogSearchFocusState(): PackageCatalogSearchNavigationState {
  markPackageCatalogSearchFocusHandoff()
  return { focusPackageCatalogSearch: true }
}

export function shouldSkipMainContentFocusForCatalogSearch(
  state: unknown,
): boolean {
  if (hasActivePackageCatalogSearchFocusHandoff()) {
    return true
  }

  if (state === null || typeof state !== 'object') {
    return false
  }

  return (state as PackageCatalogSearchNavigationState).focusPackageCatalogSearch === true
}

export function shouldFocusPackageCatalogSearch(state: unknown): boolean {
  return (
    hasActivePackageCatalogSearchFocusHandoff() ||
    (state !== null &&
      typeof state === 'object' &&
      (state as PackageCatalogSearchNavigationState).focusPackageCatalogSearch === true)
  )
}

export const PACKAGE_CATALOG_SEARCH_INPUT_MARKER = 'data-package-catalog-search'

export function isPackageCatalogSearchInputFocused(): boolean {
  const activeElement = document.activeElement
  if (!(activeElement instanceof HTMLInputElement)) {
    return false
  }

  return activeElement.hasAttribute(PACKAGE_CATALOG_SEARCH_INPUT_MARKER)
}
