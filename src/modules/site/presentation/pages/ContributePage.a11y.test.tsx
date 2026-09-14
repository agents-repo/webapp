import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import { siteRoutes } from '../routes/siteRoutes.ts'
import ContributePage from './ContributePage.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('ContributePage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<ContributePage />, {
      initialEntries: [siteRoutes.contribute],
    })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
