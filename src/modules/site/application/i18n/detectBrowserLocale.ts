import type { AppLocale } from './supportedLocales.ts'
import { defaultAppLocale } from './supportedLocales.ts'

function normalizeLanguageTag(tag: string): string {
  return tag.trim().toLowerCase().replaceAll('_', '-')
}

export function detectBrowserLocale(languages: readonly string[]): AppLocale {
  for (const language of languages) {
    const normalized = normalizeLanguageTag(language)

    if (normalized === 'en' || normalized.startsWith('en-')) {
      return 'en'
    }

    if (normalized === 'es' || normalized.startsWith('es-')) {
      return 'es'
    }

    if (normalized === 'pt-br') {
      return 'pt-BR'
    }

    if (normalized === 'pt-pt') {
      return 'pt-PT'
    }

    if (normalized === 'pt') {
      return 'pt-BR'
    }
  }

  return defaultAppLocale
}

export function readNavigatorLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') {
    return []
  }

  if (navigator.languages && navigator.languages.length > 0) {
    return [...navigator.languages]
  }

  if (navigator.language) {
    return [navigator.language]
  }

  return []
}
