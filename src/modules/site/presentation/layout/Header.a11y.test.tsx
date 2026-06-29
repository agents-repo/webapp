import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import Header from './Header'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('Header accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<Header />)

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
