import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { INSTALL_TARGET_IDS } from '../../../domain/package'
import HomeCliQuickstartSection from './HomeCliQuickstartSection'
import { CLI_INIT_COMMAND, CLI_INSTALL_COMMAND } from './homeLandingCopy'

describe('HomeCliQuickstartSection', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('copies the documented init and install commands', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    render(
      <MemoryRouter>
        <HomeCliQuickstartSection />
      </MemoryRouter>,
    )

    const initTerminal = screen.getByTestId('home-cli-init-terminal')
    expect(initTerminal).toHaveTextContent(CLI_INIT_COMMAND)
    for (const targetId of INSTALL_TARGET_IDS) {
      expect(initTerminal).toHaveTextContent(targetId)
    }

    await user.click(screen.getByRole('button', { name: 'Copy init command' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(CLI_INIT_COMMAND)
    })
    expect(screen.getAllByRole('status').some((node) => node.textContent === 'Copied to clipboard.')).toBe(
      true,
    )

    await user.click(screen.getByRole('button', { name: 'Copy install command' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(CLI_INSTALL_COMMAND)
    })
  })
})
