import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import PrivacidadePage from './PrivacidadePage.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('PrivacidadePage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<PrivacidadePage />)

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
