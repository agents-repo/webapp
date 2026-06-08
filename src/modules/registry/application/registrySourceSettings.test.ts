import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredRegistryBaseUrlOverride,
  clearStoredRegistryGitHubRepositoryUrlOverride,
  getStoredRegistryBaseUrlOverride,
  getStoredRegistryGitHubRepositoryUrlOverride,
  normalizeRegistryBaseUrlOverrideInput,
  normalizeRegistryGitHubRepositoryUrlOverrideInput,
  setStoredRegistryBaseUrlOverride,
  setStoredRegistryGitHubRepositoryUrlOverride,
  validateRegistryBaseUrlOverrideInput,
  validateRegistryGitHubRepositoryUrlOverrideInput,
} from './registrySourceSettings'

const STORAGE_KEY = 'registry.source.baseUrlOverride'
const GITHUB_STORAGE_KEY = 'registry.source.githubRepositoryUrlOverride'

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
    storage.clear()
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

  it('normalizes GitHub repository input by trimming whitespace', () => {
    expect(normalizeRegistryGitHubRepositoryUrlOverrideInput('  https://github.com/owner/repo  ')).toBe(
      'https://github.com/owner/repo',
    )
  })

  it('validates GitHub repository URLs and rejects non-GitHub hosts', () => {
    expect(validateRegistryGitHubRepositoryUrlOverrideInput('   ')).toBeNull()
    expect(validateRegistryGitHubRepositoryUrlOverrideInput('https://github.com/owner/repo')).toBeNull()
    expect(validateRegistryGitHubRepositoryUrlOverrideInput('https://registry-proxy.example.workers.dev?ref=main')).toBe(
      'Enter a valid GitHub repository URL (https://github.com/owner/repo).',
    )
    expect(validateRegistryGitHubRepositoryUrlOverrideInput('not-a-valid-url')).toBe(
      'Enter a valid GitHub repository URL (https://github.com/owner/repo).',
    )
  })

  it('persists normalized GitHub repository overrides and reads them back', () => {
    setStoredRegistryGitHubRepositoryUrlOverride('  https://github.com/owner/repo  ')

    expect(getStoredRegistryGitHubRepositoryUrlOverride()).toBe('https://github.com/owner/repo')
    expect(storage.getItem(GITHUB_STORAGE_KEY)).toBe('https://github.com/owner/repo')
  })

  it('ignores invalid stored GitHub repository values', () => {
    storage.setItem(GITHUB_STORAGE_KEY, 'https://registry-proxy.example.workers.dev?ref=main')

    expect(getStoredRegistryGitHubRepositoryUrlOverride()).toBeNull()
  })

  it('clears the persisted GitHub repository override value', () => {
    setStoredRegistryGitHubRepositoryUrlOverride('https://github.com/owner/repo')
    clearStoredRegistryGitHubRepositoryUrlOverride()

    expect(getStoredRegistryGitHubRepositoryUrlOverride()).toBeNull()
    expect(storage.getItem(GITHUB_STORAGE_KEY)).toBeNull()
  })
})
