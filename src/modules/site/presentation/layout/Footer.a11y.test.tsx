import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { externalLinkAccessibleName, externalLinkOpensInNewTabLabelEn } from '../../application/accessibility/externalLink'
import { socialLinks, type SocialLinkId } from '../../application/community/socialLinks'
import Footer from './Footer'

const socialAccessibleLabelsEn: Record<SocialLinkId, string> = {
  x: 'Agents Repo on X',
  reddit: 'Agents Repo on Reddit',
}

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
        getByRole('link', {
          name: externalLinkAccessibleName(
            socialAccessibleLabelsEn[entry.id],
            externalLinkOpensInNewTabLabelEn,
          ),
        }),
      ).toBeInTheDocument()
    }

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
