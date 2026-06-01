import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  applyThemeMode,
  type AppliedThemeMode,
  getInitialThemeMode,
  getSystemAppliedThemeMode,
  persistThemeMode,
  subscribeSystemThemeModeChange,
  type ThemeMode,
} from './themeMode'
import { ThemeModeContext, type ThemeModeContextValue } from './themeModeContext'

interface ThemeModeProviderProps {
  readonly children: ReactNode
}

function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialThemeMode())
  const systemAppliedMode = useSyncExternalStore<AppliedThemeMode>(
    subscribeSystemThemeModeChange,
    getSystemAppliedThemeMode,
    getSystemAppliedThemeMode,
  )
  const appliedMode = mode === 'auto' ? systemAppliedMode : mode

  useEffect(() => {
    persistThemeMode(mode)
    applyThemeMode(mode)
  }, [appliedMode, mode])

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      appliedMode,
      setMode,
    }),
    [appliedMode, mode],
  )

  return <ThemeModeContext.Provider value={contextValue}>{children}</ThemeModeContext.Provider>
}

export default ThemeModeProvider