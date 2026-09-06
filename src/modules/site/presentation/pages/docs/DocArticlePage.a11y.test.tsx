import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../../../test/renderWithProviders.tsx'
import DocArticlePage from './DocArticlePage.tsx'

describe('DocArticlePage accessibility', () => {
  it('renders article content and download link', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/docs/:slug" element={<DocArticlePage />} />
      </Routes>,
      { initialEntries: ['/docs/getting-started'] },
    )

    expect(await screen.findByRole('heading', { name: 'Getting started', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute(
      'href',
      '/docs/getting-started.md',
    )
    expect(screen.getByRole('navigation', { name: 'Docs' })).toBeInTheDocument()
  })
})
