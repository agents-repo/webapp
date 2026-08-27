import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../../test/renderWithProviders'
import HomeCliQuickstartSection from './HomeCliQuickstartSection'
import HomeHeroSection from './HomeHeroSection'
import { CLI_QUICKSTART_ID } from './homeLandingCopy'

describe('HomeHeroSection', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('scrolls to the CLI section when Use the CLI is clicked with the hash already present', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    })

    renderWithProviders(
      <>
        <HomeHeroSection searchControl={<div />} stickySearch={false} />
        <HomeCliQuickstartSection />
      </>,
      { initialEntries: [`/#${CLI_QUICKSTART_ID}`] },
    )

    await user.click(screen.getByRole('link', { name: 'Use the CLI' }))

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  })
})
