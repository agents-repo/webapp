import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredRegistryBaseUrlOverride,
  getStoredRegistryBaseUrlOverride,
  normalizeRegistryBaseUrlOverrideInput,
  setStoredRegistryBaseUrlOverride,
  validateRegistryBaseUrlOverrideInput,
} from './registrySourceSettings'

const STORAGE_KEY = 'registry.source.baseUrlOverride'

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    const keys = [...this.data.keys()]
    return keys[index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

describe('registrySourceSettings', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: storage,
    })
  })

  afterEach(() => {
    clearStoredRegistryBaseUrlOverride()
  })

  it('normalizes user input by trimming whitespace', () => {
    expect(normalizeRegistryBaseUrlOverrideInput('  https://example.com/base/  ')).toBe('https://example.com/base/')
  })

  it('validates empty input as reset and invalid protocols as errors', () => {
    expect(validateRegistryBaseUrlOverrideInput('   ')).toBeNull()
    expect(validateRegistryBaseUrlOverrideInput('ftp://example.com')).toBe('Enter a valid HTTP or HTTPS URL.')
    expect(validateRegistryBaseUrlOverrideInput('https://example.com')).toBeNull()
    expect(validateRegistryBaseUrlOverrideInput('https://registry-proxy.example.workers.dev?ref=main')).toBeNull()
  })

  it('persists normalized overrides and reads them back', () => {
    setStoredRegistryBaseUrlOverride('  https://example.com/custom/  ')

    expect(getStoredRegistryBaseUrlOverride()).toBe('https://example.com/custom/')
    expect(storage.getItem(STORAGE_KEY)).toBe('https://example.com/custom/')
  })

  it('ignores invalid stored values', () => {
    storage.setItem(STORAGE_KEY, 'not-a-url')

    expect(getStoredRegistryBaseUrlOverride()).toBeNull()
  })

  it('clears the persisted override value', () => {
    setStoredRegistryBaseUrlOverride('https://example.com/custom')
    clearStoredRegistryBaseUrlOverride()

    expect(getStoredRegistryBaseUrlOverride()).toBeNull()
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
  })
})