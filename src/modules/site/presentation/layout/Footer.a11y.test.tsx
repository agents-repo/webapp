import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { socialLinks } from '../../application/community/socialLinks'
import Footer from './Footer'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe('Footer accessibility', () => {
  it('has no detectable accessibility violations', async () => {
    const { container, getByRole } = renderWithProviders(<Footer />)

    for (const entry of socialLinks) {
      expect(
        getByRole('link', { name: externalLinkAccessibleName(entry.accessibleLabel) }),
      ).toBeInTheDocument()
    }

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
