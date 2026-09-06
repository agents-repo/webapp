import { createContext } from 'react'
import type { AppLocale } from './supportedLocales.ts'

export interface LocaleContextValue {
  readonly locale: AppLocale
  readonly setLocale: (locale: AppLocale) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
