import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/bootstrap-theme.scss'
import './index.scss'
import App from './App.tsx'
import ThemeModeProvider from './modules/site/application/theme/ThemeModeProvider'
import { applyThemeMode, getInitialThemeMode } from './modules/site/application/theme/themeMode'

applyThemeMode(getInitialThemeMode())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeModeProvider>
  </StrictMode>,
)
