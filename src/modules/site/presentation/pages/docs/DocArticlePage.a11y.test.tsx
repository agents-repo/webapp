import { screen, cleanup, within } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, afterEach } from 'vitest'
import { renderWithProviders } from '../../../../../test/renderWithProviders.tsx'
import DocArticlePage from './DocArticlePage.tsx'

describe('DocArticlePage accessibility', () => {
  afterEach(() => {
    cleanup()
  })

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

  it('keeps locale prefix on markdown download link', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/es/docs/:slug" element={<DocArticlePage />} />
      </Routes>,
      { initialEntries: ['/es/docs/getting-started'] },
    )

    expect(await screen.findByRole('heading', { name: 'Primeros pasos', level: 1 })).toBeInTheDocument()
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link')).toHaveAttribute('href', '/es/docs/getting-started.md')
  })
})
