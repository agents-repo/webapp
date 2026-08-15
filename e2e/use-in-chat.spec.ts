import { test, expect, mockChatPackageArtifacts } from './fixtures/registry-mock'
import { waitForCatalogSettled } from './fixtures/catalog-load'

const SAMPLE_INSTRUCTIONS_URL =
  'https://e2e.local/registry/pkg/agents-repo/sample-agent/1.0.0/instructions.json'
const SAMPLE_MARKDOWN_URL =
  'https://e2e.local/registry/pkg/agents-repo/sample-agent/1.0.0/agents/sample-agent.agent.md'

const sampleInstructionsManifest = {
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

test.describe('Use in chat', () => {
  test('shows the action only for chat-web packages and copies instruction URLs', async ({ page }) => {
    await mockChatPackageArtifacts(page, {
      instructionsUrl: SAMPLE_INSTRUCTIONS_URL,
      manifest: sampleInstructionsManifest,
      markdownUrl: SAMPLE_MARKDOWN_URL,
      markdown: '# Sample agent',
    })

    await page.goto('/')
    await waitForCatalogSettled(page)

    const sampleCard = page.locator('#package-card-agents-repo--sample-agent')
    const demoCard = page.locator('#package-card-agents-repo--demo-flow')

    await expect(sampleCard.getByRole('button', { name: 'Use sample-agent in chat' })).toBeVisible()
    await expect(demoCard.getByRole('button', { name: /Use .* in chat/ })).toHaveCount(0)

    await sampleCard.getByRole('button', { name: 'Use sample-agent in chat' }).click()

    await expect(page.getByRole('heading', { name: 'Use sample-agent in chat' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Instruction' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Latest instruction URL' })).toHaveValue(
      'https://e2e.local/registry/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md',
    )
    await expect(page.getByRole('textbox', { name: 'Pinned instruction URL (v1.0.0)' })).toHaveValue(
      'https://e2e.local/registry/pkg/agents-repo/sample-agent/agents/sample-agent.agent.md?version=1.0.0',
    )
    await expect(page.getByRole('tab', { name: 'Microsoft Copilot (web)' })).toBeVisible()
  })
})
