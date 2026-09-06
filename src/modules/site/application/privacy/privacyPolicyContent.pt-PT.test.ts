import { describe, expect, it } from 'vitest'
import { privacyPolicyContentPtPt } from './privacyPolicyContent.pt-PT.ts'

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

describe('privacyPolicyContent.pt-PT', () => {
  it('includes required sections', () => {
    const sectionIds = privacyPolicyContentPtPt.sections.map((section) => section.id)
    expect(sectionIds).toEqual(requiredSectionIds)
  })

  it('defines cookie table rows', () => {
    const cookiesSection = privacyPolicyContentPtPt.sections.find((section) => section.id === 'cookies')
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

  it('uses European Portuguese table headers', () => {
    expect(privacyPolicyContentPtPt.cookieTableHeaders.name).toBe('Nome')
    expect(privacyPolicyContentPtPt.contactLinkLabel).toBe('Contacto')
  })
})
