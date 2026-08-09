import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import PackageCliInstallAction from './PackageCliInstallAction'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('PackageCliInstallAction', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('returns null when package id is empty', () => {
    const { container } = render(
      <PackageCliInstallAction packageName="Sample" packageId="   " controlId="ns--pkg" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('opens popover with tool labels and updates init command when Cursor is selected', async () => {
    const user = userEvent.setup()

    render(
      <PackageCliInstallAction
        packageName="sample-agent"
        packageId="agents-repo/sample-agent"
        controlId="agents-repo--sample-agent"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'CLI install for sample-agent' }))

    expect(screen.getByText('Choose AI tool')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'GitHub Copilot' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Claude Code' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Cursor' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'OpenAI Codex' })).toBeInTheDocument()

    const initCopy = screen.getByRole('button', { name: 'Copy init command for sample-agent' })
    expect(initCopy).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'Cursor' }))

    expect(screen.getByTestId('cli-init-terminal-agents-repo--sample-agent')).toHaveTextContent(
      'npx agents-repo init --targets cursor',
    )
    expect(initCopy).toBeEnabled()
    expect(screen.getByTestId('cli-install-terminal-agents-repo--sample-agent')).toHaveTextContent(
      'npx agents-repo install agents-repo/sample-agent',
    )
  })

  it('builds init command with multiple selected targets in platform order', async () => {
    const user = userEvent.setup()

    render(
      <PackageCliInstallAction
        packageName="sample-agent"
        packageId="agents-repo/sample-agent"
        controlId="agents-repo--sample-agent"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'CLI install for sample-agent' }))
    await user.click(screen.getByRole('checkbox', { name: 'Cursor' }))
    await user.click(screen.getByRole('checkbox', { name: 'GitHub Copilot' }))

    expect(screen.getByTestId('cli-init-terminal-agents-repo--sample-agent')).toHaveTextContent(
      'npx agents-repo init --targets github-copilot cursor',
    )
  })

  it('does not show copy feedback after popover is dismissed before clipboard resolves', async () => {
    const user = userEvent.setup()
    let resolveWrite: (() => void) | undefined
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve
        }),
    )
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    render(
      <PackageCliInstallAction
        packageName="sample-agent"
        packageId="agents-repo/sample-agent"
        controlId="agents-repo--sample-agent"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'CLI install for sample-agent' }))
    await user.click(screen.getByRole('button', { name: 'Copy install command for sample-agent' }))

    await user.keyboard('{Escape}')

    resolveWrite?.()
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('Copied to clipboard.')).not.toBeInTheDocument()
  })

  it('copies install command to clipboard', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    render(
      <PackageCliInstallAction
        packageName="sample-agent"
        packageId="agents-repo/sample-agent"
        controlId="agents-repo--sample-agent"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'CLI install for sample-agent' }))
    await user.click(screen.getByRole('button', { name: 'Copy install command for sample-agent' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('npx agents-repo install agents-repo/sample-agent')
    })
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard.')
    })
  })

  it('has no detectable accessibility violations when popover is open', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <PackageCliInstallAction
        packageName="sample-agent"
        packageId="agents-repo/sample-agent"
        controlId="agents-repo--sample-agent"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'CLI install for sample-agent' }))

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
