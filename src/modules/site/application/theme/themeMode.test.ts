import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTestStorage } from '../../../../test/testUtils'
import {
  applyThemeMode,
  getAppliedThemeMode,
  getInitialThemeMode,
  getStoredThemeMode,
  getSystemAppliedThemeMode,
  persistThemeMode,
} from './themeMode'

const themePreferenceQuery = '(prefers-color-scheme: dark)'

function mockMatchMedia(matches: boolean): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === themePreferenceQuery ? matches : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
}

describe('getStoredThemeMode', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    clearTestStorage()
  })

  it('returns null when no theme is stored', () => {
    expect(getStoredThemeMode()).toBeNull()
  })

  it('returns a valid stored theme mode', () => {
    localStorage.setItem('theme', 'light')
    expect(getStoredThemeMode()).toBe('light')

    localStorage.setItem('theme', 'auto')
    expect(getStoredThemeMode()).toBe('auto')
  })

  it('returns null for invalid stored values', () => {
    localStorage.setItem('theme', 'sepia')
    expect(getStoredThemeMode()).toBeNull()
  })
})

describe('getInitialThemeMode', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    clearTestStorage()
  })

  it('returns the stored theme when present', () => {
    localStorage.setItem('theme', 'light')
    expect(getInitialThemeMode()).toBe('light')
  })

  it('defaults to dark when nothing is stored', () => {
    expect(getInitialThemeMode()).toBe('dark')
  })
})

describe('getAppliedThemeMode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns explicit light and dark modes unchanged', () => {
    expect(getAppliedThemeMode('light')).toBe('light')
    expect(getAppliedThemeMode('dark')).toBe('dark')
  })

  it('resolves auto to dark when the system prefers dark', () => {
    mockMatchMedia(true)
    expect(getAppliedThemeMode('auto')).toBe('dark')
  })

  it('resolves auto to light when the system prefers light', () => {
    mockMatchMedia(false)
    expect(getAppliedThemeMode('auto')).toBe('light')
  })
})

describe('getSystemAppliedThemeMode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns dark when prefers-color-scheme is dark', () => {
    mockMatchMedia(true)
    expect(getSystemAppliedThemeMode()).toBe('dark')
  })

  it('returns light when prefers-color-scheme is light', () => {
    mockMatchMedia(false)
    expect(getSystemAppliedThemeMode()).toBe('light')
  })
})

describe('applyThemeMode', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-bs-theme')
    document.querySelector('meta[name="theme-color"]')?.remove()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.removeAttribute('data-bs-theme')
    document.querySelector('meta[name="theme-color"]')?.remove()
  })

  it('sets data-bs-theme on the document element', () => {
    expect(applyThemeMode('light')).toBe('light')
    expect(document.documentElement.dataset.bsTheme).toBe('light')
  })

  it('creates or updates the theme-color meta tag', () => {
    applyThemeMode('dark')

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    expect(themeColorMeta?.content).toBe('#13101b')
  })

  it('resolves auto mode from system preference', () => {
    mockMatchMedia(false)

    expect(applyThemeMode('auto')).toBe('light')
    expect(document.documentElement.dataset.bsTheme).toBe('light')
  })
})

describe('persistThemeMode', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    clearTestStorage()
  })

  it('stores the theme mode in localStorage', () => {
    persistThemeMode('auto')
    expect(localStorage.getItem('theme')).toBe('auto')
  })
})
