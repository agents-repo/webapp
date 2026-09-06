import { describe, expect, it } from 'vitest'
import {
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
