import { test, expect, mockPackageDetailArtifacts } from './fixtures/registry-mock'
import { E2E_REGISTRY_BASE_URL } from './fixtures/catalog'
import { waitForCatalogSettled } from './fixtures/catalog-load'
import { sampleAgentPackageDetail } from './fixtures/package-detail'

const sampleAgentDetailUrl = `${E2E_REGISTRY_BASE_URL}/packages/agents-repo/sample-agent/detail.json`
const sampleAgentMarkdownUrl = `${E2E_REGISTRY_BASE_URL}/packages/agents-repo/sample-agent/versions/1.0.0/agents/sample-agent.agent.md`

test.describe('Package pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockPackageDetailArtifacts(page, {
      detailUrl: sampleAgentDetailUrl,
      detail: sampleAgentPackageDetail,
      markdownUrl: sampleAgentMarkdownUrl,
      markdown: '# Sample agent body',
    })
  })

  test('lists all packages at /packages', async ({ page }) => {
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    await expect(page.getByRole('heading', { name: 'All packages', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'demo-flow' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'legacy-tool' })).toBeVisible()
  })

  test('scopes search to a namespace index', async ({ page }) => {
    await page.goto('/packages/agents-repo')
    await waitForCatalogSettled(page)

    await expect(page.getByRole('heading', { name: 'agents-repo packages', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'legacy-tool' })).toHaveCount(0)

    await page.getByRole('textbox', { name: /search registry packages/i }).fill('demo')
    await expect(page.getByRole('heading', { name: 'demo-flow' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toHaveCount(0)
  })

  test('opens the in-app detail page from View and the card title', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)

    await page.getByRole('link', { name: 'View sample-agent' }).click()
    await expect(page).toHaveURL('/packages/agents-repo/sample-agent')
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 1 })).toBeVisible()
    await expect(page.getByRole('search')).toHaveCount(0)
    await expect(page.getByRole('link', { name: /View sample-agent on GitHub/ })).toBeVisible()

    await page.goto('/')
    await waitForCatalogSettled(page)
    await page.getByRole('heading', { name: 'sample-agent' }).getByRole('link').click()
    await expect(page).toHaveURL('/packages/agents-repo/sample-agent')
  })

  test('keeps the CLI install popover inside the viewport on the package page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 640 })
    await page.goto('/packages/agents-repo/sample-agent')
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: 'CLI install for sample-agent' }).click()

    const popover = page.locator('#cli-install-popover-agents-repo--sample-agent-detail')
    await expect(popover).toBeVisible()
    await expect(page.getByText('Choose AI tool')).toBeVisible()
    await expect(popover).toBeInViewport({ ratio: 1 })
  })

  test('renders a mermaid flowchart in the package README', async ({ page }) => {
    const mermaidReadme = [
      '# sample-agent',
      '',
      '```mermaid',
      'flowchart TD',
      '  startNode[Start] --> endNode[End]',
      '```',
    ].join('\n')

    await mockPackageDetailArtifacts(page, {
      detailUrl: sampleAgentDetailUrl,
      detail: {
        ...sampleAgentPackageDetail,
        readmeMarkdown: mermaidReadme,
      },
      markdownUrl: sampleAgentMarkdownUrl,
      markdown: '# Sample agent body',
    })

    await page.goto('/packages/agents-repo/sample-agent')
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'README' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Mermaid diagram' })).toBeVisible()
  })

  test('keeps a broken mermaid README fence as source', async ({ page }) => {
    const brokenReadme = ['# sample-agent', '', '```mermaid', 'not a valid mermaid diagram', '```'].join(
      '\n',
    )

    await mockPackageDetailArtifacts(page, {
      detailUrl: sampleAgentDetailUrl,
      detail: {
        ...sampleAgentPackageDetail,
        readmeMarkdown: brokenReadme,
      },
      markdownUrl: sampleAgentMarkdownUrl,
      markdown: '# Sample agent body',
    })

    await page.goto('/packages/agents-repo/sample-agent')
    await expect(page.getByRole('heading', { name: 'README' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Mermaid diagram' })).toHaveCount(0)
    await expect(page.locator('code.language-mermaid')).toContainText('not a valid mermaid diagram')
  })

  test('expands agent markdown on the package page', async ({ page }) => {
    const yamlReadme = [
      '---',
      'name: sample-readme',
      'description: README metadata',
      'inputs:',
      '  - name: readme-input',
      '    type: string',
      '    description: README input description.',
      'outputs:',
      '  - name: readme-output',
      '    type: string',
      '    description: README output description.',
      '---',
      '',
      '# sample-agent',
      '',
      'A sample README.',
    ].join('\n')
    const yamlAgentMarkdown = [
      '---',
      'name: sample-agent',
      'description: A sample agent.',
      'version: 1.0.0',
      'license: MIT',
      'inputs:',
      '  - name: user-message',
      '    type: string',
      '    description: The user question.',
      'outputs:',
      '  - name: reply',
      '    type: string',
      '    description: Conversational reply.',
      '---',
      '',
      '# Overview',
      '',
      'Sample agent body',
    ].join('\n')

    await mockPackageDetailArtifacts(page, {
      detailUrl: sampleAgentDetailUrl,
      detail: {
        ...sampleAgentPackageDetail,
        readmeMarkdown: yamlReadme,
      },
      markdownUrl: sampleAgentMarkdownUrl,
      markdown: yamlAgentMarkdown,
    })

    await page.goto('/packages/agents-repo/sample-agent')
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'README' })).toBeVisible()

    const readmeSection = page.getByRole('heading', { name: 'README' }).locator('..')
    await expect(readmeSection.getByRole('cell', { name: 'sample-readme', exact: true })).toBeVisible()
    await expect(readmeSection.getByRole('columnheader', { name: 'name' })).toHaveCount(2)
    await expect(readmeSection.getByRole('cell', { name: 'readme-input', exact: true })).toBeVisible()
    await expect(readmeSection.getByRole('cell', { name: 'readme-output', exact: true })).toBeVisible()

    await page.getByRole('button', { name: /A sample agent/ }).click()
    const agentMarkdown = page.locator('.package-instruction-accordion .package-detail-markdown')
    await expect(agentMarkdown.getByRole('cell', { name: 'sample-agent', exact: true })).toBeVisible()
    await expect(agentMarkdown.getByRole('cell', { name: 'user-message', exact: true })).toBeVisible()
    await expect(agentMarkdown.getByRole('cell', { name: 'reply', exact: true })).toBeVisible()
    await expect(agentMarkdown.getByRole('heading', { name: 'Overview' })).toBeVisible()
    await expect(agentMarkdown.getByText('Sample agent body')).toBeVisible()
    await expect(page).toHaveURL('/packages/agents-repo/sample-agent')
  })

  test('shows not-found for unknown package paths without redirecting home', async ({ page }) => {
    await page.goto('/packages/agents-repo/not-a-real-package')
    await expect(page.getByRole('heading', { name: 'Package not found', level: 1 })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Explore ready-to-use agents and flows' }),
    ).toHaveCount(0)

    await page.goto('/packages/missing-ns/also-missing/extra')
    await expect(page.getByRole('heading', { name: 'Package not found', level: 1 })).toBeVisible()
  })
})
