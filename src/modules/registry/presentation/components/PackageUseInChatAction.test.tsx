import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import PackageUseInChatAction from './PackageUseInChatAction'

const instructionsManifest = {
  schemaVersion: '1.0.0',
  package: 'agents-repo/sample-agent',
  version: '1.0.0',
  instructions: [
    {
      kind: 'agent',
      id: 'sample-agent',
      path: '/pkg/agents-repo/sample-agent/1.0.0/agents/sample-agent.agent.md',
    },
    {
      kind: 'flow',
      id: 'sample-flow',
      path: '/pkg/agents-repo/sample-agent/1.0.0/flows/sample-flow.agent.md',
      agentInstructions: ['/pkg/agents-repo/sample-agent/1.0.0/agents/sample-agent.agent.md'],
    },
  ],
}

const defaultProps = {
  packageName: 'sample-agent',
  namespace: 'agents-repo',
  packageId: 'sample-agent',
  latest: '1.0.0',
  registryBaseUrl: 'https://registry-proxy.example.workers.dev?ref=v2.x',
  controlId: 'agents-repo--sample-agent',
  quickstart: 'https://github.com/agents-repo/registry/blob/v2.x/packages/agents-repo/sample-agent/README.md',
}

const jsonResponse = (payload: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(payload),
})

const textResponse = (text: string, ok = true, status = 200) => ({
  ok,
  status,
  text: () => Promise.resolve(text),
})

describe('PackageUseInChatAction', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('opens the modal, loads instructions, and keeps the picker visible', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(instructionsManifest)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use sample-agent in chat' }))

    expect(await screen.findByRole('heading', { name: 'Use sample-agent in chat' })).toBeInTheDocument()
    expect(screen.getByLabelText('Instruction')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Instruction' })).toHaveDisplayValue('sample-agent')
    expect(
      screen.getByDisplayValue(
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x&version=1.0.0',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'ChatGPT' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Gemini' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Microsoft Copilot (web)' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Package quickstart (opens in a new tab)' }),
    ).toHaveAttribute('href', defaultProps.quickstart)
  })

  it('shows a flow-aware starter prompt when a flow with agentInstructions is selected', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(instructionsManifest)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use sample-agent in chat' }))
    await screen.findByLabelText('Instruction')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Instruction' }), 'flow:sample-flow')

    expect(screen.getByDisplayValue(/Follow this flow:/)).toHaveValue(
      [
        'Follow this flow:',
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/flows/sample-flow.agent.md?ref=v2.x',
        '',
        'Load these agent instructions in order:',
        '1. https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x',
      ].join('\n'),
    )
  })

  it('copies the latest instruction URL', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(instructionsManifest)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use sample-agent in chat' }))
    await screen.findByRole('button', { name: 'Copy latest instruction URL for sample-agent' })
    await user.click(screen.getByRole('button', { name: 'Copy latest instruction URL for sample-agent' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x',
      )
    })
    expect(screen.getAllByRole('status').some((node) => node.textContent === 'Copied to clipboard.')).toBe(
      true,
    )
  })

  it('fetches and copies instruction markdown from the versioned /pkg/ URL', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('instructions.json')) {
        return Promise.resolve(jsonResponse(instructionsManifest))
      }
      return Promise.resolve(textResponse('# Sample agent'))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use sample-agent in chat' }))
    await screen.findByRole('button', { name: 'Copy instruction markdown' })
    await user.click(screen.getByRole('button', { name: 'Copy instruction markdown' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('# Sample agent')
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/1.0.0/agents/sample-agent.agent.md?ref=v2.x',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('shows a modal error when instructions.json cannot be loaded', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({}, false, 404)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use sample-agent in chat' }))

    expect(await screen.findByText('Unable to load chat instructions (404).')).toBeInTheDocument()
    expect(screen.queryByLabelText('Instruction')).not.toBeInTheDocument()
  })
})
