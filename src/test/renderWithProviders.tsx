import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import '../modules/site/application/i18n/i18n.ts'
import { LocaleProvider } from '../modules/site/application/i18n/LocaleProvider'
import ThemeModeProvider from '../modules/site/application/theme/ThemeModeProvider'
import CookieConsentProvider from '../modules/site/presentation/layout/CookieConsentProvider'

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
        <CookieConsentProvider>
          <HelmetProvider>
            <MemoryRouter initialEntries={initialEntries}>
              <LocaleProvider>
                <Suspense fallback={null}>{children}</Suspense>
              </LocaleProvider>
            </MemoryRouter>
          </HelmetProvider>
        </CookieConsentProvider>
      </ThemeModeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
