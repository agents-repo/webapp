import { getBrowserWindow } from '../browserGlobals.ts'
import type { AppLocale } from './supportedLocales.ts'
import { appLocales, defaultAppLocale } from './supportedLocales.ts'

const localeStorageKey = 'locale'

function getLocaleStorage(): Storage | null {
  const browserWindow = getBrowserWindow()
  if (!browserWindow) {
    return null
  }

  try {
    return browserWindow.localStorage
  } catch {
    return null
  }
}

function isAppLocale(value: string | null): value is AppLocale {
  return value !== null && (appLocales as readonly string[]).includes(value)
}

export function getStoredLocale(): AppLocale | null {
  const storage = getLocaleStorage()
  if (!storage) {
    return null
  }

  const storedLocale = storage.getItem(localeStorageKey)
  return isAppLocale(storedLocale) ? storedLocale : null
}

export function persistLocale(locale: AppLocale): void {
  const storage = getLocaleStorage()
  if (!storage) {
    return
  }

  storage.setItem(localeStorageKey, locale)
}

export function getInitialLocale(): AppLocale {
  return getStoredLocale() ?? defaultAppLocale
}
