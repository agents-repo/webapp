import { createContext, useContext } from 'react'
import type { AppliedThemeMode, ThemeMode } from './themeMode'

export interface ThemeModeContextValue {
  readonly mode: ThemeMode
  readonly appliedMode: AppliedThemeMode
  readonly setMode: (mode: ThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined)

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider')
  }

  return context
}