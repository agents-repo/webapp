import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import RepositoryDetailPage from './RepositoryDetailPage.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('RepositoryDetailPage accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/repositories/:slug" element={<RepositoryDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/repositories/registry'],
      },
    )

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
