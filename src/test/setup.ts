import '@testing-library/jest-dom/vitest'
import * as matchers from 'vitest-axe/matchers'
import { expect } from 'vitest'

expect.extend(matchers)

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
