import { describe, expect, it } from 'vitest'
import { privacyPolicyContentEn } from './privacyPolicyContent.en.ts'

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

describe('privacyPolicyContent.en', () => {
  it('includes required sections', () => {
    const sectionIds = privacyPolicyContentEn.sections.map((section) => section.id)
    expect(sectionIds).toEqual(requiredSectionIds)
  })

  it('defines cookie table rows', () => {
    const cookiesSection = privacyPolicyContentEn.sections.find((section) => section.id === 'cookies')
    expect(cookiesSection?.cookieRows?.length).toBeGreaterThan(0)
    expect(cookiesSection?.cookieRows?.some((row) => row.name === 'analytics-consent')).toBe(true)
  })

  it('has a last updated date', () => {
    expect(privacyPolicyContentEn.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
