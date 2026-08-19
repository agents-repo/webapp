import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTestStorage } from '../../../test/testUtils'
import {
  CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY,
  getInitialCatalogFiltersSidebarCollapsed,
  getStoredCatalogFiltersSidebarCollapsed,
  persistCatalogFiltersSidebarCollapsed,
} from './catalogFilterPreferences'

describe('catalogFilterPreferences', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    clearTestStorage()
    vi.restoreAllMocks()
  })

  it('returns null when nothing is stored and defaults to expanded', () => {
    expect(getStoredCatalogFiltersSidebarCollapsed()).toBeNull()
    expect(getInitialCatalogFiltersSidebarCollapsed()).toBe(false)
  })

  it('reads and writes the sidebar collapsed preference', () => {
    persistCatalogFiltersSidebarCollapsed(true)
    expect(localStorage.getItem(CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY)).toBe('true')
    expect(getStoredCatalogFiltersSidebarCollapsed()).toBe(true)
    expect(getInitialCatalogFiltersSidebarCollapsed()).toBe(true)

    persistCatalogFiltersSidebarCollapsed(false)
    expect(getStoredCatalogFiltersSidebarCollapsed()).toBe(false)
  })

  it('treats invalid stored values as missing', () => {
    localStorage.setItem(CATALOG_FILTERS_SIDEBAR_COLLAPSED_KEY, 'collapsed')
    expect(getStoredCatalogFiltersSidebarCollapsed()).toBeNull()
    expect(getInitialCatalogFiltersSidebarCollapsed()).toBe(false)
  })

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(getStoredCatalogFiltersSidebarCollapsed()).toBeNull()
    expect(() => persistCatalogFiltersSidebarCollapsed(true)).not.toThrow()
  })
})
