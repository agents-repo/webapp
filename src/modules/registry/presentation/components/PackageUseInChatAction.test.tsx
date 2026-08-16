import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHAT_URL_FETCH_FALLBACK_WARNING } from '../../application/chatConsumption'
import { resetChatInstructionsCacheForTests } from '../../infrastructure/chatInstructionsRepository'
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

const OPEN_IN_CHATGPT_NAME = 'Open in ChatGPT (opens in a new tab)'

const agentStarterPrompt = [
  'Follow these agent instructions:',
  'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x',
].join('\n')

const flowStarterPrompt = [
  'Follow this flow:',
  'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/flows/sample-flow.agent.md?ref=v2.x',
  '',
  'Load these agent instructions in order:',
  '1. https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x',
].join('\n')

const chatgptOpenUrl = (prompt: string): string => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`

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
    resetChatInstructionsCacheForTests()
    vi.unstubAllGlobals()
  })

  it('opens the modal, loads instructions, and keeps the picker visible', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(instructionsManifest)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))

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
    expect(screen.getByRole('link', { name: OPEN_IN_CHATGPT_NAME })).toHaveAttribute(
      'href',
      chatgptOpenUrl(agentStarterPrompt),
    )
    expect(screen.getByRole('heading', { name: 'If the chat cannot load the URL' })).toBeInTheDocument()
    expect(screen.getByText(CHAT_URL_FETCH_FALLBACK_WARNING)).toBeInTheDocument()
    expect(screen.queryByText('Includes this flow and its related agent files.')).not.toBeInTheDocument()
  })

  it('shows a flow-aware starter prompt when a flow with agentInstructions is selected', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(instructionsManifest)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    await screen.findByLabelText('Instruction')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Instruction' }), 'flow:sample-flow')

    expect(screen.getByDisplayValue(/Follow this flow:/)).toHaveValue(flowStarterPrompt)
    expect(screen.getByText('Includes this flow and its related agent files.')).toBeInTheDocument()
  })

  it('updates Open in ChatGPT to the current starter prompt and hides it on other tabs', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(instructionsManifest)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    await screen.findByLabelText('Instruction')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Instruction' }), 'flow:sample-flow')

    expect(screen.getByRole('link', { name: OPEN_IN_CHATGPT_NAME })).toHaveAttribute(
      'href',
      chatgptOpenUrl(flowStarterPrompt),
    )

    await user.click(screen.getByRole('tab', { name: 'Gemini' }))
    expect(
      within(screen.getByRole('tabpanel', { name: 'Gemini' })).queryByRole('link', {
        name: OPEN_IN_CHATGPT_NAME,
      }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'If the chat cannot load the URL' })).toBeInTheDocument()
    expect(screen.getByText(CHAT_URL_FETCH_FALLBACK_WARNING)).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
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

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    await screen.findByRole('button', { name: 'Copy instruction markdown' })
    await user.click(screen.getByRole('button', { name: 'Copy instruction markdown' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Follow these agent instructions:\n\n# Sample agent')
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/1.0.0/agents/sample-agent.agent.md?ref=v2.x',
      expect.objectContaining({
        headers: { Accept: 'text/markdown, text/plain, */*' },
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Copy instruction markdown' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(2)
    })
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url).includes('.agent.md')),
    ).toHaveLength(1)
  })

  it('copies flow markdown bundled with related agent files', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('instructions.json')) {
        return Promise.resolve(jsonResponse(instructionsManifest))
      }
      if (String(url).includes('/flows/sample-flow.agent.md')) {
        return Promise.resolve(textResponse('# Sample flow'))
      }
      return Promise.resolve(textResponse('# Sample agent'))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    await screen.findByLabelText('Instruction')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Instruction' }), 'flow:sample-flow')
    await user.click(screen.getByRole('button', { name: 'Copy instruction markdown' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        [
          'Follow this flow:',
          '',
          '# Sample flow',
          '',
          'Load these agent instructions in order:',
          '',
          '1. sample-agent',
          '',
          '# Sample agent',
        ].join('\n'),
      )
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/1.0.0/flows/sample-flow.agent.md?ref=v2.x',
      expect.objectContaining({
        headers: { Accept: 'text/markdown, text/plain, */*' },
      }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/1.0.0/agents/sample-agent.agent.md?ref=v2.x',
      expect.objectContaining({
        headers: { Accept: 'text/markdown, text/plain, */*' },
      }),
    )
  })

  it('does not copy when a related agent markdown fetch fails', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('instructions.json')) {
        return Promise.resolve(jsonResponse(instructionsManifest))
      }
      if (String(url).includes('/flows/sample-flow.agent.md')) {
        return Promise.resolve(textResponse('# Sample flow'))
      }
      return Promise.resolve(textResponse('# Sample agent', false, 404))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    await screen.findByLabelText('Instruction')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Instruction' }), 'flow:sample-flow')
    await user.click(screen.getByRole('button', { name: 'Copy instruction markdown' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load instruction markdown (404).',
    )
    expect(screen.getByLabelText('Instruction')).toBeInTheDocument()
    expect(writeText).not.toHaveBeenCalled()
  })

  it('shows a modal error when instructions.json cannot be loaded', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({}, false, 404)),
    )

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))

    expect(await screen.findByText('Unable to load chat instructions (404).')).toBeInTheDocument()
    expect(screen.queryByLabelText('Instruction')).not.toBeInTheDocument()
  })

  it('does not refetch instructions.json when the same package is opened again', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(instructionsManifest))
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    expect(await screen.findByLabelText('Instruction')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    expect(screen.getByLabelText('Instruction')).toBeInTheDocument()
    expect(screen.queryByText('Loading chat instructions')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('hides stale copy URLs while a new instructions.json version is loading', async () => {
    const user = userEvent.setup()
    const manifestV2 = {
      ...instructionsManifest,
      version: '1.0.1',
      instructions: instructionsManifest.instructions.map((entry) => ({
        ...entry,
        path: entry.path.replaceAll('1.0.0', '1.0.1'),
      })),
    }
    let resolveUpgrade: ((value: ReturnType<typeof jsonResponse>) => void) | undefined
    const upgradeResponse = new Promise<ReturnType<typeof jsonResponse>>((resolve) => {
      resolveUpgrade = resolve
    })
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('/1.0.1/instructions.json')) {
        return upgradeResponse
      }
      return Promise.resolve(jsonResponse(instructionsManifest))
    })
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    expect(await screen.findByLabelText('Instruction')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x&version=1.0.0',
      ),
    ).toBeInTheDocument()

    rerender(<PackageUseInChatAction {...defaultProps} latest="1.0.1" />)

    expect(screen.getByText('Loading chat instructions')).toBeInTheDocument()
    expect(screen.queryByLabelText('Instruction')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue(/version=1\.0\.0/)).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue(/version=1\.0\.1/)).not.toBeInTheDocument()

    resolveUpgrade?.(jsonResponse(manifestV2))

    expect(await screen.findByLabelText('Instruction')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?ref=v2.x&version=1.0.1',
      ),
    ).toBeInTheDocument()
  })

  it('fetches instructions.json again when the package version changes', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(instructionsManifest))
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = renderWithProviders(<PackageUseInChatAction {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    expect(await screen.findByLabelText('Instruction')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))

    rerender(<PackageUseInChatAction {...defaultProps} latest="1.0.1" />)
    await user.click(screen.getByRole('button', { name: 'Use in chat for sample-agent' }))
    expect(await screen.findByLabelText('Instruction')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
