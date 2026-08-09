import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import GuideArticlePage from './GuideArticlePage.tsx'

describe('GuideArticlePage accessibility', () => {
  it('renders article heading and download link', () => {
    render(
      <MemoryRouter initialEntries={['/guide/getting-started']}>
        <Routes>
          <Route path="/guide/:slug" element={<GuideArticlePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Getting started', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute(
      'href',
      '/guide/getting-started.md',
    )
    expect(screen.getByRole('navigation', { name: 'Guide' })).toBeInTheDocument()
  })
})
