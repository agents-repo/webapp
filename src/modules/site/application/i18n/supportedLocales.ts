export const appLocales = ['en', 'es', 'pt-BR', 'pt-PT'] as const

export type AppLocale = (typeof appLocales)[number]

export const defaultAppLocale: AppLocale = 'en'

export interface LocaleDefinition {
  readonly id: AppLocale
  readonly urlSlug: string | null
  readonly displayName: string
  readonly hreflang: string
  readonly ogLocale: string
  readonly htmlLang: string
  readonly googleTranslateCode: string
}

export const localeDefinitions: readonly LocaleDefinition[] = [
  {
    id: 'en',
    urlSlug: null,
    displayName: 'English',
    hreflang: 'en',
    ogLocale: 'en_US',
    htmlLang: 'en',
    googleTranslateCode: 'en',
  },
  {
    id: 'es',
    urlSlug: 'es',
    displayName: 'Español',
    hreflang: 'es',
    ogLocale: 'es_ES',
    htmlLang: 'es',
    googleTranslateCode: 'es',
  },
  {
    id: 'pt-BR',
    urlSlug: 'pt-br',
    displayName: 'Português (Brasil)',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    htmlLang: 'pt-BR',
    googleTranslateCode: 'pt',
  },
  {
    id: 'pt-PT',
    urlSlug: 'pt-pt',
    displayName: 'Português (Portugal)',
    hreflang: 'pt-PT',
    ogLocale: 'pt_PT',
    htmlLang: 'pt-PT',
    googleTranslateCode: 'pt',
  },
]

const localeById = new Map(localeDefinitions.map((definition) => [definition.id, definition]))
const localeBySlug = new Map(
  localeDefinitions
    .filter((definition) => definition.urlSlug !== null)
    .map((definition) => [definition.urlSlug as string, definition]),
)

export function getLocaleDefinition(locale: AppLocale): LocaleDefinition {
  const definition = localeById.get(locale)
  if (!definition) {
    throw new Error(`Unknown locale: ${locale}`)
  }

  return definition
}

export function isSupportedLocaleSlug(slug: string): boolean {
  return localeBySlug.has(slug.toLowerCase())
}

export function localeFromUrlSlug(slug: string): AppLocale | undefined {
  return localeBySlug.get(slug.toLowerCase())?.id
}

export function getLocaleUrlSlug(locale: AppLocale): string | null {
  return getLocaleDefinition(locale).urlSlug
}
