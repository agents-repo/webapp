import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  CookieConsentContext,
  type CookieConsentContextValue,
} from '../../application/analytics/cookieConsentContext.ts'

interface CookieConsentProviderProps {
  readonly children: ReactNode
}

function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  const openCookiePreferences = useCallback(() => {
    setIsPreferencesOpen(true)
  }, [])

  const closeCookiePreferences = useCallback(() => {
    setIsPreferencesOpen(false)
  }, [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      isPreferencesOpen,
      openCookiePreferences,
      closeCookiePreferences,
    }),
    [closeCookiePreferences, isPreferencesOpen, openCookiePreferences],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export default CookieConsentProvider
