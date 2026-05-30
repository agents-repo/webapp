import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/bootstrap-theme.scss'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
