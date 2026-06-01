import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './modules/registry/presentation/pages/HomePage'
import Footer from './modules/site/presentation/layout/Footer'
import Header from './modules/site/presentation/layout/Header'
import AboutPage from './modules/site/presentation/pages/AboutPage'
import ContactPage from './modules/site/presentation/pages/ContactPage'
import HelpUsPage from './modules/site/presentation/pages/HelpUsPage'
import { siteRoutes } from './modules/site/presentation/routes/siteRoutes'
import './App.scss'

interface RegistryCatalogStatusNote {
  summaryText: string
  sourceUrl: string
  statusTag: string
}

function App() {
  const [headerSearchSlot, setHeaderSearchSlot] = useState<ReactNode | null>(null)
  const [registrySettingsVersion, setRegistrySettingsVersion] = useState(0)
  const [registryCatalogStatusNote, setRegistryCatalogStatusNote] = useState<RegistryCatalogStatusNote | null>(null)

  return (
    <div className="app-shell">
      <Header
        searchSlot={headerSearchSlot}
        registryCatalogStatusNote={registryCatalogStatusNote}
        onRegistrySettingsSaved={() => setRegistrySettingsVersion((currentValue) => currentValue + 1)}
      />

      <Routes>
        <Route
          path={siteRoutes.home}
          element={
            <HomePage
              setHeaderSearchSlot={setHeaderSearchSlot}
              registrySettingsVersion={registrySettingsVersion}
              onCatalogStatusNoteChange={setRegistryCatalogStatusNote}
            />
          }
        />
        <Route path={siteRoutes.about} element={<AboutPage />} />
        <Route path={siteRoutes.contact} element={<ContactPage />} />
        <Route path={siteRoutes.helpUs} element={<HelpUsPage />} />
        <Route path="*" element={<Navigate to={siteRoutes.home} replace />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
