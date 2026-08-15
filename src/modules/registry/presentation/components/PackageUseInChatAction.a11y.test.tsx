import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import PackageUseInChatAction from './PackageUseInChatAction'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

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
  ],
}

describe('PackageUseInChatAction accessibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('has no detectable accessibility violations when the modal is open', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(instructionsManifest),
      }),
    )

    const { container } = renderWithProviders(
      <PackageUseInChatAction
        packageName="sample-agent"
        namespace="agents-repo"
        packageId="sample-agent"
        latest="1.0.0"
        registryBaseUrl="https://registry-proxy.example.workers.dev?ref=v2.x"
        controlId="agents-repo--sample-agent"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Use sample-agent in chat' }))
    await screen.findByLabelText('Instruction')

    expect(screen.getByRole('link', { name: 'Open in ChatGPT (opens in a new tab)' })).toBeInTheDocument()

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
