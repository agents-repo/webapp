import '@testing-library/jest-dom/vitest'
import * as matchers from 'vitest-axe/matchers'
import { afterEach, expect } from 'vitest'
import { resetRegistryMemoryCachesForTests } from './testUtils'

expect.extend(matchers)

afterEach(async () => {
  await resetRegistryMemoryCachesForTests()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
