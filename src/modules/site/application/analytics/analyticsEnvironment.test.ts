import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isProductionAnalyticsEnabled } from './analyticsEnvironment.ts'

describe('isProductionAnalyticsEnabled', () => {
  beforeEach(() => {
    vi.stubEnv('MODE', 'development')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns true only for production MODE', () => {
    vi.stubEnv('MODE', 'production')
    expect(isProductionAnalyticsEnabled()).toBe(true)

    vi.stubEnv('MODE', 'e2e')
    expect(isProductionAnalyticsEnabled()).toBe(false)

    vi.stubEnv('MODE', 'development')
    expect(isProductionAnalyticsEnabled()).toBe(false)
  })
})
