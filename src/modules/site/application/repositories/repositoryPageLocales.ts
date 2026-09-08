import i18n from '../i18n/i18n.ts'
import type { AppLocale } from '../i18n/supportedLocales.ts'

export function getLocalizedRepositoryDescription(slug: string, locale: AppLocale): string | undefined {
  const key = `repositories.entries.${slug}.description`
  const translation = i18n.t(key, { lng: locale, ns: 'pages', defaultValue: '' })

  return translation || undefined
}
