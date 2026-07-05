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
    expect(cookiesSection?.cookieRows?.length).toBeGreaterThan(0)
    expect(cookiesSection?.cookieRows?.some((row) => row.name === 'analytics-consent')).toBe(true)
  })

  it('uses Portuguese table headers', () => {
    expect(privacyPolicyContentPtBr.cookieTableHeaders.name).toBe('Nome')
  })
})
