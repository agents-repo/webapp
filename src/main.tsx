import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import './styles/bootstrap-theme.scss'
import './index.scss'
import './modules/site/application/i18n/i18n.ts'
import App from './App.tsx'
import { LocaleProvider } from './modules/site/application/i18n/LocaleProvider'
import ThemeModeProvider from './modules/site/application/theme/ThemeModeProvider'
import { applyThemeMode, getInitialThemeMode } from './modules/site/application/theme/themeMode'

applyThemeMode(getInitialThemeMode())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <HelmetProvider>
        <BrowserRouter>
          <LocaleProvider>
            <App />
          </LocaleProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ThemeModeProvider>
  </StrictMode>,
)
