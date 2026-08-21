import { describe, expect, it } from 'vitest'
import { privacyPolicyContentPtBr } from './privacyPolicyContent.pt-BR.ts'

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

describe('privacyPolicyContent.pt-BR', () => {
  it('includes required sections', () => {
    const sectionIds = privacyPolicyContentPtBr.sections.map((section) => section.id)
    expect(sectionIds).toEqual(requiredSectionIds)
  })

  it('defines cookie table rows', () => {
    const cookiesSection = privacyPolicyContentPtBr.sections.find((section) => section.id === 'cookies')
    const cookieNames = cookiesSection?.cookieRows?.map((row) => row.name) ?? []
    const expectedNames = [
      'analytics-consent',
      'theme',
      'catalog.filters.sidebarCollapsed',
      'agents-repo-webapp-registry',
      'html-pages-cache and app-static-runtime-cache',
    ]

    expect(cookieNames.length).toBeGreaterThan(0)
    expect(cookieNames).toEqual(expect.arrayContaining(expectedNames))
  })

  it('uses Portuguese table headers', () => {
    expect(privacyPolicyContentPtBr.cookieTableHeaders.name).toBe('Nome')
  })
})
