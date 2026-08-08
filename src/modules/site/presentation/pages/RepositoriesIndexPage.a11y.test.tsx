import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import RepositoriesIndexPage from './RepositoriesIndexPage.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('RepositoriesIndexPage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<RepositoriesIndexPage />, {
      initialEntries: ['/repositories'],
    })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
