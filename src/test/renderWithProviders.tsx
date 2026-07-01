import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ThemeModeProvider from '../modules/site/application/theme/ThemeModeProvider'

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <ThemeModeProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </ThemeModeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
