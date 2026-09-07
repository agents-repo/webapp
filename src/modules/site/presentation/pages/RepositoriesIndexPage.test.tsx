import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import RepositoriesIndexPage from './RepositoriesIndexPage.tsx'

describe('RepositoriesIndexPage', () => {
  it('keeps a space between the contributing guide link and the following text in pt-BR', async () => {
    renderWithProviders(<RepositoriesIndexPage />, {
      initialEntries: ['/pt-br/repositories'],
    })

    const contributeLink = await screen.findByRole('link', { name: /guia de contribuição da organização/i })
    const contributeParagraph = contributeLink.closest('p')

    expect(contributeParagraph).not.toBeNull()
    expect(contributeParagraph?.textContent).toMatch(/contribuição da organização/)
    expect(contributeParagraph?.textContent).not.toMatch(/contribuiçãoda/)

    await waitFor(() => {
      expect(contributeParagraph?.textContent).toContain('da organização')
    })
  })
})
