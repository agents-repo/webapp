import { describe, expect, it } from 'vitest'
import {
  getLocaleHreflangAlternates,
  getLocaleHomePath,
  localizedSitePath,
  parseLocaleFromPathname,
  stripLocalePrefix,
  swapLocaleInPathname,
} from './localePath.ts'

describe('parseLocaleFromPathname', () => {
  it('returns default locale for unprefixed paths', () => {
    expect(parseLocaleFromPathname('/about')).toEqual({
      locale: 'en',
      pathnameWithoutLocale: '/about',
    })
  })

  it('parses locale prefixes', () => {
    expect(parseLocaleFromPathname('/es/about')).toEqual({
      locale: 'es',
      pathnameWithoutLocale: '/about',
    })
    expect(parseLocaleFromPathname('/pt-br/privacy')).toEqual({
      locale: 'pt-BR',
      pathnameWithoutLocale: '/privacy',
    })
    expect(parseLocaleFromPathname('/pt-pt/')).toEqual({
      locale: 'pt-PT',
      pathnameWithoutLocale: '/',
    })
  })
})

describe('localizedSitePath', () => {
  it('keeps English routes unprefixed', () => {
    expect(localizedSitePath('/about', 'en')).toBe('/about/')
  })

  it('prefixes non-English locales', () => {
    expect(localizedSitePath('/about', 'es')).toBe('/es/about/')
    expect(localizedSitePath('/', 'pt-BR')).toBe('/pt-br/')
  })

  it('keeps doc markdown crawl files unslashed', () => {
    expect(localizedSitePath('/docs/getting-started.md', 'en')).toBe('/docs/getting-started.md')
    expect(localizedSitePath('/docs/getting-started.md', 'es')).toBe('/es/docs/getting-started.md')
    expect(localizedSitePath('/docs/getting-started.md', 'pt-PT')).toBe('/pt-pt/docs/getting-started.md')
  })
})

describe('stripLocalePrefix', () => {
  it('removes locale segments', () => {
    expect(stripLocalePrefix('/es/packages')).toBe('/packages')
  })
})

describe('swapLocaleInPathname', () => {
  it('replaces locale while preserving the route', () => {
    expect(swapLocaleInPathname('/es/about', 'pt-BR')).toBe('/pt-br/about/')
  })
})

describe('getLocaleHomePath', () => {
  it('returns localized home paths', () => {
    expect(getLocaleHomePath('en')).toBe('/')
    expect(getLocaleHomePath('es')).toBe('/es/')
  })
})

describe('getLocaleHreflangAlternates', () => {
  it('emits locale-prefixed markdown URLs without trailing slashes', () => {
    const alternates = getLocaleHreflangAlternates('/docs/getting-started.md', 'https://agents-repo.org')

    expect(alternates).toEqual([
      { hreflang: 'en', href: 'https://agents-repo.org/docs/getting-started.md' },
      { hreflang: 'es', href: 'https://agents-repo.org/es/docs/getting-started.md' },
      { hreflang: 'pt-BR', href: 'https://agents-repo.org/pt-br/docs/getting-started.md' },
      { hreflang: 'pt-PT', href: 'https://agents-repo.org/pt-pt/docs/getting-started.md' },
    ])
  })
})
