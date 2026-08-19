import { describe, expect, it } from 'vitest'
import { getPackageCatalogFacetGroupLabel, toPackageCatalogFilterControlId } from './packageCatalogFilterUi'

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
