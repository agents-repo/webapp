import type { AppLocale } from '../i18n/supportedLocales.ts'
import { defaultAppLocale } from '../i18n/supportedLocales.ts'
import { getDocCatalogEntry } from './docsCatalog.ts'

export interface DocPageMeta {
  readonly title: string
  readonly description: string
}

type DocPageMetaResolver = (slug: string, locale: AppLocale) => DocPageMeta | undefined

let resolver: DocPageMetaResolver | null = null

export function registerDocPageMetaResolver(nextResolver: DocPageMetaResolver): void {
  resolver = nextResolver
}

export function getDocPageMeta(
  slug: string,
  locale: AppLocale = defaultAppLocale,
): DocPageMeta | undefined {
  const catalogEntry = getDocCatalogEntry(slug)
  if (!catalogEntry) {
    return undefined
  }

  if (locale !== defaultAppLocale && resolver) {
    const localized = resolver(slug, locale)
    if (localized) {
      return localized
    }
  }

  return {
    title: catalogEntry.title,
    description: catalogEntry.description,
  }
}
