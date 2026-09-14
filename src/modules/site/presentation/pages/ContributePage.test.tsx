import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import ContributePage from './ContributePage.tsx'

describe('ContributePage', () => {
  it('keeps a space between the repositories link and the following text in pt-BR', async () => {
    renderWithProviders(<ContributePage />, {
      initialEntries: ['/pt-br/contribute'],
    })

    const repositoriesLink = await screen.findByRole('link', { name: /^repositórios$/i })
    const builtInTheOpenParagraph = repositoriesLink.closest('p')

    expect(builtInTheOpenParagraph).not.toBeNull()
    expect(builtInTheOpenParagraph?.textContent).toMatch(/repositórios/i)
    expect(builtInTheOpenParagraph?.textContent).not.toMatch(/repositórioso/)

    await waitFor(() => {
      expect(builtInTheOpenParagraph?.textContent).toContain('ou explore cada projeto abaixo.')
    })
  })
})
