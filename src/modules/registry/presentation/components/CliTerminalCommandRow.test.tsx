import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CliTerminalCommandRow from './CliTerminalCommandRow'

describe('CliTerminalCommandRow', () => {
  it('renders command text and invokes copy when enabled', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()

    render(
      <CliTerminalCommandRow
        commandText="npx agents-repo install agents-repo/foo"
        copyLabel="Copy install command"
        onCopy={onCopy}
        labelId="test-label"
        dataTestId="terminal-row"
      />,
    )

    expect(screen.getByTestId('terminal-row')).toHaveTextContent('npx agents-repo install agents-repo/foo')
    await user.click(screen.getByRole('button', { name: 'Copy install command' }))
    expect(onCopy).toHaveBeenCalledTimes(1)
  })

  it('shows copy feedback in a tooltip anchored to the copy button', async () => {
    const { rerender } = render(
      <CliTerminalCommandRow
        commandText="npx agents-repo install agents-repo/foo"
        copyLabel="Copy install command"
        onCopy={() => {}}
        labelId="tooltip-label"
        dataTestId="tooltip-terminal"
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <CliTerminalCommandRow
        commandText="npx agents-repo install agents-repo/foo"
        copyLabel="Copy install command"
        onCopy={() => {}}
        labelId="tooltip-label"
        dataTestId="tooltip-terminal"
        copyFeedback="Copied to clipboard."
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard.')
    })
  })

  it('applies placeholder styling and disables copy', () => {
    render(
      <CliTerminalCommandRow
        commandText="npx agents-repo init --targets"
        copyLabel="Copy init command"
        onCopy={() => {}}
        copyDisabled
        isPlaceholder
        labelId="placeholder-label"
        dataTestId="placeholder-terminal"
      />,
    )

    expect(screen.getByTestId('placeholder-terminal')).toHaveClass('package-cli-terminal--placeholder')
    expect(screen.getByRole('button', { name: 'Copy init command' })).toBeDisabled()
  })
})
