/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ThemeModeProvider from '../modules/site/application/theme/ThemeModeProvider'

function TestProviders({ children }: { readonly children: ReactNode }) {
  return (
    <ThemeModeProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ThemeModeProvider>
  )
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: TestProviders, ...options })
}
