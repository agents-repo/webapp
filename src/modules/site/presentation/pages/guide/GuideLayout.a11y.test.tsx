import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../../test/renderWithProviders.tsx'
import GuideLayout from './GuideLayout.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('GuideLayout accessibility', () => {
  afterEach(() => {
    cleanup()
  })

  it('has no detectable accessibility violations with guide search', async () => {
    const { container } = renderWithProviders(
      <GuideLayout>
        <h1>Test article</h1>
      </GuideLayout>,
      { initialEntries: ['/guide/getting-started'] },
    )

    expect(screen.getByRole('search', { name: 'Search guides' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Search guides' })).toBeInTheDocument()

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })

  it('shows search results and live status when typing', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <GuideLayout>
        <h1>Test article</h1>
      </GuideLayout>,
      { initialEntries: ['/guide'] },
    )

    const input = screen.getByRole('combobox', { name: 'Search guides' })
    await user.type(input, 'doctor diagnostics')

    expect(screen.getByRole('listbox', { name: 'Guide search results' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /doctor diagnostics/i })).toBeInTheDocument()
    expect(screen.getByText('1 guide result.')).toBeInTheDocument()
  })
})
