import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../../test/renderWithProviders.tsx'
import DocLayout from './DocLayout.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
    // Sidebar and mobile copies are mutually `display: none` in the browser.
    // jsdom does not apply Bootstrap utilities, so both search landmarks exist.
    'landmark-unique': { enabled: false },
  },
}

function getSearchCombobox() {
  const inputs = screen.getAllByRole('combobox', { name: 'Search docs' })
  expect(inputs.length).toBeGreaterThan(0)
  return inputs[0]
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

    expect(screen.getAllByRole('search', { name: 'Search docs' })).toHaveLength(2)
    expect(screen.getAllByRole('combobox', { name: 'Search docs' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Browse docs' })).toHaveAttribute(
      'aria-controls',
      'docs-nav-offcanvas',
    )

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })

  it('opens the docs Offcanvas from Browse docs', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <DocLayout>
        <h1>Test article</h1>
      </DocLayout>,
      { initialEntries: ['/docs'] },
    )

    await user.click(screen.getByRole('button', { name: 'Browse docs' }))

    expect(screen.getByRole('dialog', { name: 'Docs' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Docs topics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse docs' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses the Offcanvas when a topic is chosen', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <DocLayout>
        <h1>Test article</h1>
      </DocLayout>,
      { initialEntries: ['/docs'] },
    )

    await user.click(screen.getByRole('button', { name: 'Browse docs' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Docs' })).getByRole('link', { name: 'Getting started' }),
    )

    expect(screen.getByRole('button', { name: 'Browse docs' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows search results and live status when typing', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <DocLayout>
        <h1>Test article</h1>
      </DocLayout>,
      { initialEntries: ['/docs'] },
    )

    const input = getSearchCombobox()
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

    const input = getSearchCombobox()
    await user.type(input, '   ')
    expect(input).toHaveValue('   ')
    expect(screen.queryByRole('listbox', { name: 'Doc search results' })).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })
})
