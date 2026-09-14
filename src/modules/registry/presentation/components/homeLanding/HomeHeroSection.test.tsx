import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../../../test/renderWithProviders'
import HomeHeroSection from './HomeHeroSection'

describe('HomeHeroSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders install-first hero CTAs', () => {
    renderWithProviders(<HomeHeroSection searchControl={<div />} stickySearch={false} />)

    expect(screen.getByRole('link', { name: 'Browse packages' })).toHaveAttribute('href', '/packages/')
    expect(screen.getByRole('link', { name: 'Publish an agent' })).toHaveAttribute(
      'href',
      '/docs/submitting-a-package/',
    )
    expect(screen.getByRole('link', { name: 'View on GitHub — Agents Repo organization (opens in a new tab)' })).toHaveAttribute(
      'href',
      'https://github.com/agents-repo',
    )
  })
})
