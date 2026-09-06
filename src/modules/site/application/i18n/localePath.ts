import { normalizeSitePathname, publicSitePath } from '../../presentation/routes/siteRoutes.ts'
import type { AppLocale } from './supportedLocales.ts'
import {
  defaultAppLocale,
  getLocaleDefinition,
  getLocaleUrlSlug,
  isSupportedLocaleSlug,
  localeFromUrlSlug,
} from './supportedLocales.ts'

export interface ParsedLocalePath {
  readonly locale: AppLocale
  readonly pathnameWithoutLocale: string
}

export function parseLocaleFromPathname(pathname: string): ParsedLocalePath {
  const { pathOnly } = splitPathQueryAndHash(pathname)
  const normalized = normalizeSitePathname(pathOnly.length > 0 ? pathOnly : '/')

  if (normalized === '/') {
    return { locale: defaultAppLocale, pathnameWithoutLocale: '/' }
  }

  const segments = normalized.slice(1).split('/').filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase()

  if (firstSegment && isSupportedLocaleSlug(firstSegment)) {
    const locale = localeFromUrlSlug(firstSegment) ?? defaultAppLocale
    const remainder = segments.slice(1).join('/')
    const pathnameWithoutLocale = remainder.length > 0 ? `/${remainder}` : '/'

    return { locale, pathnameWithoutLocale }
  }

  return { locale: defaultAppLocale, pathnameWithoutLocale: normalized }
}

function splitPathQueryAndHash(pathname: string): { readonly pathOnly: string; readonly suffix: string } {
  const queryIndex = pathname.indexOf('?')
  const hashIndex = pathname.indexOf('#')
  const splitCandidates = [queryIndex, hashIndex].filter((index) => index >= 0)

  if (splitCandidates.length === 0) {
    return { pathOnly: pathname, suffix: '' }
  }

  const splitAt = Math.min(...splitCandidates)
  return { pathOnly: pathname.slice(0, splitAt), suffix: pathname.slice(splitAt) }
}

export function stripLocalePrefix(pathname: string): string {
  return parseLocaleFromPathname(pathname).pathnameWithoutLocale
}

export function localizedSitePath(pathname: string, locale: AppLocale): string {
  const { pathOnly, suffix } = splitPathQueryAndHash(pathname)
  const normalized = normalizeSitePathname(pathOnly.length > 0 ? pathOnly : '/')
  const slug = getLocaleUrlSlug(locale)

  if (!slug) {
    return publicSitePath(`${normalized}${suffix}`)
  }

  if (normalized === '/') {
    return publicSitePath(`/${slug}${suffix}`)
  }

  return publicSitePath(`/${slug}${normalized}${suffix}`)
}

export function getLocaleHomePath(locale: AppLocale): string {
  return localizedSitePath('/', locale)
}

export function swapLocaleInPathname(pathname: string, targetLocale: AppLocale): string {
  const { pathnameWithoutLocale } = parseLocaleFromPathname(pathname)
  const { suffix } = splitPathQueryAndHash(pathname)
  return `${localizedSitePath(pathnameWithoutLocale, targetLocale)}${suffix}`
}

export function getLocaleHreflangAlternates(
  pathname: string,
  origin: string,
): readonly { readonly hreflang: string; readonly href: string }[] {
  const { pathnameWithoutLocale } = parseLocaleFromPathname(pathname)

  return ['en', 'es', 'pt-BR', 'pt-PT'].map((localeId) => {
    const locale = localeId as AppLocale
    const definition = getLocaleDefinition(locale)
    const href = `${origin}${localizedSitePath(pathnameWithoutLocale, locale)}`

    return { hreflang: definition.hreflang, href }
  })
}
