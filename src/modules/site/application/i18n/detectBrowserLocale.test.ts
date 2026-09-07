import { describe, expect, it } from 'vitest'
import { detectBrowserLocale } from './detectBrowserLocale.ts'

describe('detectBrowserLocale', () => {
  it('detects English variants', () => {
    expect(detectBrowserLocale(['en-US'])).toBe('en')
    expect(detectBrowserLocale(['en-GB', 'fr'])).toBe('en')
  })

  it('detects Spanish variants', () => {
    expect(detectBrowserLocale(['es-ES'])).toBe('es')
  })

  it('detects Portuguese variants', () => {
    expect(detectBrowserLocale(['pt-BR'])).toBe('pt-BR')
    expect(detectBrowserLocale(['pt-PT'])).toBe('pt-PT')
    expect(detectBrowserLocale(['pt'])).toBe('pt-BR')
  })

  it('falls back to English for unknown languages', () => {
    expect(detectBrowserLocale(['fr-FR'])).toBe('en')
    expect(detectBrowserLocale([])).toBe('en')
  })
})
