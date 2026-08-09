import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../../test/renderWithProviders.tsx'
import DocLayout from './DocLayout.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('DocLayout accessibility', () => {
  afterEach(() => {
    cleanup()
  })

  it('has no detectable accessibility violations with doc search', async () => {
    const { container } = renderWithProviders(
      <DocLayout>
        <h1>Test article</h1>
      </DocLayout>,
      { initialEntries: ['/docs/getting-started'] },
    )

    expect(screen.getByRole('search', { name: 'Search docs' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Search docs' })).toBeInTheDocument()

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })

  it('shows search results and live status when typing', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <DocLayout>
        <h1>Test article</h1>
      </DocLayout>,
      { initialEntries: ['/docs'] },
    )

    const input = screen.getByRole('combobox', { name: 'Search docs' })
    await user.type(input, 'doctor diagnostics')

    expect(screen.getByRole('listbox', { name: 'Doc search results' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /doctor diagnostics/i })).toBeInTheDocument()
    expect(screen.getByText('1 doc result for "doctor diagnostics".')).toBeInTheDocument()
  })

  it('clears whitespace-only search on Escape', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <DocLayout>
        <h1>Test article</h1>
      </DocLayout>,
      { initialEntries: ['/docs'] },
    )

    const input = screen.getByRole('combobox', { name: 'Search docs' })
    await user.type(input, '   ')
    expect(input).toHaveValue('   ')
    expect(screen.queryByRole('listbox', { name: 'Doc search results' })).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })
})
