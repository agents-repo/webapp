import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import AccessibilityPage from './AccessibilityPage'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('AccessibilityPage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<AccessibilityPage />)

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
