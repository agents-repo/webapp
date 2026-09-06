import { describe, expect, it } from 'vitest'
import { privacyPolicyContentEs } from './privacyPolicyContent.es.ts'

const requiredSectionIds = [
  'introduction',
  'data-we-collect',
  'how-we-use-data',
  'cookies',
  'third-parties',
  'transfers',
  'retention',
  'your-rights',
  'children',
  'do-not-sell',
  'changes',
  'contact',
]

describe('privacyPolicyContent.es', () => {
  it('includes required sections', () => {
    const sectionIds = privacyPolicyContentEs.sections.map((section) => section.id)
    expect(sectionIds).toEqual(requiredSectionIds)
  })

  it('defines cookie table rows', () => {
    const cookiesSection = privacyPolicyContentEs.sections.find((section) => section.id === 'cookies')
    const cookieNames = cookiesSection?.cookieRows?.map((row) => row.name) ?? []
    const expectedNames = [
      'analytics-consent',
      'theme',
      'locale',
      'catalog.filters.sidebarCollapsed',
      'agents-repo-webapp-registry',
      'html-pages-cache and app-static-runtime-cache',
    ]

    expect(cookieNames.length).toBeGreaterThan(0)
    expect(cookieNames).toEqual(expect.arrayContaining(expectedNames))
  })

  it('has a last updated date', () => {
    expect(privacyPolicyContentEs.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
