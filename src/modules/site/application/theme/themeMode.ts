export const themeModes = ['light', 'dark', 'auto'] as const

export type ThemeMode = (typeof themeModes)[number]

export type AppliedThemeMode = Exclude<ThemeMode, 'auto'>

const themeStorageKey = 'theme'
const themePreferenceQuery = '(prefers-color-scheme: dark)'

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'auto'
}

function getBrowserWindow(): Window | null {
  const globalScope = globalThis as typeof globalThis & { window?: Window }

  return globalScope.window ?? null
}

function getThemeStorage(): Storage | null {
  const browserWindow = getBrowserWindow()
  if (!browserWindow) {
    return null
  }

  try {
    return browserWindow.localStorage
  } catch {
    return null
  }
}

export function getStoredThemeMode(): ThemeMode | null {
  const storage = getThemeStorage()
  if (!storage) {
    return null
  }

  const storedThemeMode = storage.getItem(themeStorageKey)

  return isThemeMode(storedThemeMode) ? storedThemeMode : null
}

export function getInitialThemeMode(): ThemeMode {
  return getStoredThemeMode() ?? 'dark'
}

export function getAppliedThemeMode(themeMode: ThemeMode): AppliedThemeMode {
  if (themeMode !== 'auto') {
    return themeMode
  }

  return getSystemAppliedThemeMode()
}

export function applyThemeMode(themeMode: ThemeMode): AppliedThemeMode {
  const appliedThemeMode = getAppliedThemeMode(themeMode)
  globalThis.document.documentElement.dataset.bsTheme = appliedThemeMode

  return appliedThemeMode
}

export function persistThemeMode(themeMode: ThemeMode) {
  const storage = getThemeStorage()
  if (!storage) {
    return
  }

  storage.setItem(themeStorageKey, themeMode)
}

export function getSystemAppliedThemeMode(): AppliedThemeMode {
  const browserWindow = getBrowserWindow()
  if (!browserWindow) {
    return 'dark'
  }

  return browserWindow.matchMedia(themePreferenceQuery).matches ? 'dark' : 'light'
}

export function subscribeSystemThemeModeChange(onChange: () => void) {
  const browserWindow = getBrowserWindow()
  if (!browserWindow) {
    return () => {}
  }

  const mediaQuery = browserWindow.matchMedia(themePreferenceQuery)
  mediaQuery.addEventListener('change', onChange)

  return () => {
    mediaQuery.removeEventListener('change', onChange)
  }
}