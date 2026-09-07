import i18n from './i18n.ts'
import { defaultAppLocale, getLocaleDefinition, type AppLocale } from './supportedLocales.ts'

export function getIntlLocale(locale?: string): string {
  const candidate = (locale ?? i18n.language ?? defaultAppLocale) as AppLocale

  try {
    return getLocaleDefinition(candidate).htmlLang
  } catch {
    return getLocaleDefinition(defaultAppLocale).htmlLang
  }
}
