import type { AppLocale } from './supportedLocales.ts'
import { getLocaleDefinition } from './supportedLocales.ts'

export function buildGoogleTranslateUrl(pageUrl: string, locale: AppLocale): string {
  const { googleTranslateCode } = getLocaleDefinition(locale)
  const encodedUrl = encodeURIComponent(pageUrl)

  return `https://translate.google.com/translate?sl=auto&tl=${googleTranslateCode}&u=${encodedUrl}`
}

export function shouldShowGoogleTranslate(locale: AppLocale): boolean {
  return locale !== 'en'
}
