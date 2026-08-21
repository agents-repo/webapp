import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import PwaInstallControl from './PwaInstallControl'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('PwaInstallControl accessibility', () => {
  it('has no detectable accessibility violations for the how-to control', async () => {
    const { container } = renderWithProviders(<PwaInstallControl />)

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
