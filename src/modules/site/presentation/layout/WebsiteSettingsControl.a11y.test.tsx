import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import WebsiteSettingsControl from './WebsiteSettingsControl'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

vi.mock('../../../registry/application/registrySource', async () => {
  const actual = await vi.importActual('../../../registry/application/registrySource')

  return {
    ...actual,
    resolveRegistrySourceConfig: vi.fn().mockResolvedValue({
      baseUrl: 'https://example.com/registry',
      githubRepositoryUrl: 'https://github.com/agents-repo/registry',
      sourceMode: 'configured',
      githubRepositorySourceMode: 'configured',
      baseUrlRefResolution: null,
      githubRepositoryRefResolution: null,
    }),
  }
})

describe('WebsiteSettingsControl accessibility', () => {
  it('has no detectable accessibility violations when the modal is open', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<WebsiteSettingsControl />)

    await user.click(screen.getByRole('button', { name: 'Open website settings' }))

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
