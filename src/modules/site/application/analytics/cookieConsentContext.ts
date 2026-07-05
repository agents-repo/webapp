import { createContext, useContext } from 'react'

export interface CookieConsentContextValue {
  readonly isPreferencesOpen: boolean
  readonly openCookiePreferences: () => void
  readonly closeCookiePreferences: () => void
}

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }

  return context
}
