import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import PackageSiteNotFound from './PackageSiteNotFound'

describe('PackageSiteNotFound', () => {
  afterEach(() => {
    cleanup()
  })

  it('echoes the requested package path and recovery links', () => {
    renderWithProviders(
      <Routes>
        <Route path="/packages/:namespace/:packageId" element={<PackageSiteNotFound />} />
      </Routes>,
      { initialEntries: ['/packages/agents-repo/missing-agent'] },
    )

    expect(screen.getByRole('heading', { name: 'Package not found', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText('The package path agents-repo/missing-agent is not in the current registry catalog.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Search the catalog for agents-repo/missing-agent' }),
    ).toHaveAttribute('href', '/packages/?q=agents-repo%2Fmissing-agent')
    expect(screen.getByRole('link', { name: 'Browse all packages' })).toHaveAttribute('href', '/packages/')
    expect(screen.getByRole('link', { name: 'Read getting started' })).toHaveAttribute(
      'href',
      '/docs/getting-started/',
    )
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/')
  })

  it('echoes invalid catch-all package paths', () => {
    renderWithProviders(
      <Routes>
        <Route path="/packages/*" element={<PackageSiteNotFound />} />
      </Routes>,
      { initialEntries: ['/packages/not-valid!!!'] },
    )

    expect(
      screen.getByText('The package path not-valid!!! is not in the current registry catalog.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Search the catalog for not-valid!!!' })).toHaveAttribute(
      'href',
      '/packages/?q=not-valid%21%21%21',
    )
  })
})
