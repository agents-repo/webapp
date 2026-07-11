import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AnalyticsRouteTracker from './modules/site/application/analytics/AnalyticsRouteTracker'
import RouteAnnouncer from './modules/site/application/accessibility/RouteAnnouncer'
import SiteHead from './modules/site/application/seo/SiteHead'
import SkipLink from './modules/site/application/accessibility/SkipLink'
import RegistryCatalogProvider from './modules/registry/application/RegistryCatalogProvider'
import HomePage from './modules/registry/presentation/pages/HomePage'
import Footer from './modules/site/presentation/layout/Footer'
import Header from './modules/site/presentation/layout/Header'
import AboutPage from './modules/site/presentation/pages/AboutPage'
import AccessibilityPage from './modules/site/presentation/pages/AccessibilityPage'
import ContactPage from './modules/site/presentation/pages/ContactPage'
import CookieConsentBanner from './modules/site/presentation/layout/CookieConsentBanner'
import CookieConsentProvider from './modules/site/presentation/layout/CookieConsentProvider'
import HelpUsPage from './modules/site/presentation/pages/HelpUsPage'
import PrivacyPage from './modules/site/presentation/pages/PrivacyPage'
import PrivacidadePage from './modules/site/presentation/pages/PrivacidadePage'
import { siteRoutes } from './modules/site/presentation/routes/siteRoutes'
import type { RegistryCatalogStatusNote } from './modules/site/application/websiteSettings/registryCatalogStatusNote'
import './App.scss'

function App() {
  const [headerSearchSlot, setHeaderSearchSlot] = useState<ReactNode | null>(null)
  const [registrySettingsVersion, setRegistrySettingsVersion] = useState(0)
  const [registryCatalogStatusNote, setRegistryCatalogStatusNote] = useState<RegistryCatalogStatusNote | null>(null)

  return (
    <CookieConsentProvider>
      <RegistryCatalogProvider
        registrySettingsVersion={registrySettingsVersion}
        onCatalogStatusNoteChange={setRegistryCatalogStatusNote}
      >
        <div className="app-shell">
          <SkipLink />
          <RouteAnnouncer />
          <AnalyticsRouteTracker />
          <SiteHead />
          <CookieConsentBanner />
          <Header
            searchSlot={headerSearchSlot}
            registryCatalogStatusNote={registryCatalogStatusNote}
            onRegistrySettingsSaved={() => {
              setRegistryCatalogStatusNote(null)
              setRegistrySettingsVersion((currentValue) => currentValue + 1)
            }}
          />

          <Routes>
            <Route
              path={siteRoutes.home}
              element={<HomePage setHeaderSearchSlot={setHeaderSearchSlot} />}
            />
            <Route path={siteRoutes.about} element={<AboutPage />} />
            <Route path={siteRoutes.contact} element={<ContactPage />} />
            <Route path={siteRoutes.helpUs} element={<HelpUsPage />} />
            <Route path={siteRoutes.accessibility} element={<AccessibilityPage />} />
            <Route path={siteRoutes.privacy} element={<PrivacyPage />} />
            <Route path={siteRoutes.privacyPtBr} element={<PrivacidadePage />} />
            <Route path="*" element={<Navigate to={siteRoutes.home} replace />} />
          </Routes>

          <Footer />
        </div>
      </RegistryCatalogProvider>
    </CookieConsentProvider>
  )
}

export default App
