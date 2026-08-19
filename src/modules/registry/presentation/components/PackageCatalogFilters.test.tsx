import { describe, expect, it } from 'vitest'
import { toPackageCatalogFilterControlId } from './packageCatalogFilterUi'

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
