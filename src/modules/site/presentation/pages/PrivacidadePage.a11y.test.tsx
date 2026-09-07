import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import { localizedSitePath } from '../../application/i18n/localePath.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'
import PrivacyPage from './PrivacyPage.tsx'

const axeOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
}

describe.each([
  ['pt-BR', localizedSitePath(siteRoutes.privacy, 'pt-BR')],
  ['pt-PT', localizedSitePath(siteRoutes.privacy, 'pt-PT')],
] as const)('PrivacyPage accessibility (%s)', (_locale, initialEntry) => {
  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<PrivacyPage />, {
      initialEntries: [initialEntry],
    })

    const results = await axe(container, axeOptions)
    expect(results.violations).toHaveLength(0)
  })
})
