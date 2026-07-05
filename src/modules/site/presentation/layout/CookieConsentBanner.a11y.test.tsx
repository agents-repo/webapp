import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import CookieConsentBanner from './CookieConsentBanner.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('CookieConsentBanner accessibility', () => {
  it('has no detectable accessibility violations when visible', async () => {
    const { container } = renderWithProviders(<CookieConsentBanner />)

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
