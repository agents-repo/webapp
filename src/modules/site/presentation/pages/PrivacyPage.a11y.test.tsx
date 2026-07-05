import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import PrivacyPage from './PrivacyPage.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('PrivacyPage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<PrivacyPage />)

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
