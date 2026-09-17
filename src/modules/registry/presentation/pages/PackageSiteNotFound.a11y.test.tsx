import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import PackageSiteNotFound from './PackageSiteNotFound'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('PackageSiteNotFound accessibility', () => {
  afterEach(() => {
    cleanup()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/packages/:namespace/:packageId" element={<PackageSiteNotFound />} />
      </Routes>,
      { initialEntries: ['/packages/agents-repo/missing-agent'] },
    )

    await screen.findByRole('heading', { name: 'Package not found' })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
