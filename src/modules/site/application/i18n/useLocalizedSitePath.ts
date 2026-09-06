import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { localizedSitePath } from './localePath.ts'
import { useLocale } from './useLocale.ts'
import type { AppLocale } from './supportedLocales.ts'

export function useLocalizedSitePath() {
  const { locale } = useLocale()

  return useCallback((pathname: string) => localizedSitePath(pathname, locale), [locale])
}

export function useLocalizedNavigate() {
  const navigate = useNavigate()
  const localizedSitePathForLocale = useLocalizedSitePath()

  return useCallback(
    (pathname: string, options?: { replace?: boolean }) => {
      void navigate(localizedSitePathForLocale(pathname), { replace: options?.replace })
    },
    [localizedSitePathForLocale, navigate],
  )
}

export function useSwitchLocale() {
  const navigate = useNavigate()
  const { locale, setLocale } = useLocale()

  return useCallback(
    (targetLocale: AppLocale, pathname: string) => {
      if (targetLocale === locale) {
        return
      }

      setLocale(targetLocale)
      void navigate(localizedSitePath(pathname, targetLocale), { replace: false })
    },
    [locale, navigate, setLocale],
  )
}
