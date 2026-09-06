import { useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import i18n from './i18n.ts'
import { detectBrowserLocale, readNavigatorLanguages } from './detectBrowserLocale.ts'
import { LocaleContext } from './localeContext.ts'
import { getLocaleHomePath, parseLocaleFromPathname } from './localePath.ts'
import { getStoredLocale, persistLocale } from './localeStorage.ts'
import type { AppLocale } from './supportedLocales.ts'
import { getLocaleDefinition } from './supportedLocales.ts'

interface LocaleProviderProps {
  readonly children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { locale, pathnameWithoutLocale } = useMemo(
    () => parseLocaleFromPathname(location.pathname),
    [location.pathname],
  )

  useEffect(() => {
    const storedLocale = getStoredLocale()
    const isHomePath = pathnameWithoutLocale === '/'

    if (!storedLocale && isHomePath && locale === 'en') {
      const detectedLocale = detectBrowserLocale(readNavigatorLanguages())
      if (detectedLocale !== 'en') {
        void navigate(getLocaleHomePath(detectedLocale), { replace: true })
      }
    }
  }, [locale, navigate, pathnameWithoutLocale])

  useEffect(() => {
    persistLocale(locale)
    void i18n.changeLanguage(locale)
    document.documentElement.lang = getLocaleDefinition(locale).htmlLang
  }, [locale])

  const setLocale = (nextLocale: AppLocale) => {
    persistLocale(nextLocale)
  }

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale],
  )

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}
