import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DocArticlePage from './DocArticlePage.tsx'

describe('DocArticlePage accessibility', () => {
  it('renders article content and download link', () => {
    render(
      <MemoryRouter initialEntries={['/docs/getting-started']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocArticlePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Getting started', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute(
      'href',
      '/docs/getting-started.md',
    )
    expect(screen.getByRole('navigation', { name: 'Docs' })).toBeInTheDocument()
  })
})
