import { getBrowserWindow } from '../../site/application/browserGlobals.ts'

export const CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY = 'catalog.filters.sidebarCollapsed'

function getPreferenceStorage(): Storage | null {
  const browserWindow = getBrowserWindow()
  if (!browserWindow) {
    return null
  }

  try {
    return browserWindow.localStorage
  } catch {
    return null
  }
}

export function getStoredCatalogFiltersSidebarCollapsed(): boolean | null {
  const storage = getPreferenceStorage()
  if (!storage) {
    return null
  }

  try {
    const storedValue = storage.getItem(CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY)
    if (storedValue === 'true') {
      return true
    }

    if (storedValue === 'false') {
      return false
    }

    return null
  } catch {
    return null
  }
}

export function getInitialCatalogFiltersSidebarCollapsed(): boolean {
  return getStoredCatalogFiltersSidebarCollapsed() ?? false
}

export function persistCatalogFiltersSidebarCollapsed(collapsed: boolean): void {
  const storage = getPreferenceStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY, collapsed ? 'true' : 'false')
  } catch {
    // Preference writes must not crash the listing when storage is blocked.
  }
}
