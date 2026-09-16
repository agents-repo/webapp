import '../modules/site/application/docs/docsPageMeta.browser.ts'
import '@testing-library/jest-dom/vitest'
import * as matchers from 'vitest-axe/matchers'
import { afterEach, beforeAll, expect } from 'vitest'
import i18n from '../modules/site/application/i18n/i18n.ts'
import enCatalog from '../locales/en/catalog.json' with { type: 'json' }
import enDocs from '../locales/en/docs.json' with { type: 'json' }
import enPages from '../locales/en/pages.json' with { type: 'json' }
import enShell from '../locales/en/shell.json' with { type: 'json' }
import { resetRegistryMemoryCachesForTests } from './testUtils'

expect.extend(matchers)

beforeAll(async () => {
  try {
    localStorage.setItem('locale', 'en')
  } catch {
    // Ignore storage failures; locale pinning is best-effort.
  }

  i18n.addResourceBundle('en', 'shell', enShell, true, true)
  i18n.addResourceBundle('en', 'catalog', enCatalog, true, true)
  i18n.addResourceBundle('en', 'pages', enPages, true, true)
  i18n.addResourceBundle('en', 'docs', enDocs, true, true)
  await i18n.changeLanguage('en')
})

afterEach(async () => {
  await resetRegistryMemoryCachesForTests()
})

function testMatchMediaMatches(query: string): boolean {
  if (query === '(prefers-color-scheme: dark)') {
    return true
  }

  const minWidthMatch = /^\(min-width:\s*(\d+)px\)$/.exec(query)
  if (minWidthMatch) {
    return window.innerWidth >= Number.parseInt(minWidthMatch[1], 10)
  }

  return false
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: testMatchMediaMatches(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
