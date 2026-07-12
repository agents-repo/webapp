import { Suspense, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AnalyticsRouteTracker from './modules/site/application/analytics/AnalyticsRouteTracker'
import RouteAnnouncer from './modules/site/application/accessibility/RouteAnnouncer'
import RouteDocumentTitle from './modules/site/application/accessibility/RouteDocumentTitle'
import SiteHead from './modules/site/application/seo/SiteHead'
import SkipLink from './modules/site/application/accessibility/SkipLink'
import RegistryCatalogProvider from './modules/registry/presentation/catalog/RegistryCatalogProvider'
import HomePage from './modules/registry/presentation/pages/HomePage'
import Footer from './modules/site/presentation/layout/Footer'
import Header from './modules/site/presentation/layout/Header'
import CookieConsentBanner from './modules/site/presentation/layout/CookieConsentBanner'
import CookieConsentProvider from './modules/site/presentation/layout/CookieConsentProvider'
import RouteLoadingFallback from './modules/site/presentation/layout/RouteLoadingFallback'
import LazyRouteErrorBoundary from './modules/site/presentation/layout/LazyRouteErrorBoundary'
import {
  createLazySitePages,
  type LazySitePages,
} from './modules/site/presentation/routes/lazySitePages'
import { siteRoutes } from './modules/site/presentation/routes/siteRoutes'
import type { RegistryCatalogStatusNote } from './modules/site/application/websiteSettings/registryCatalogStatusNote'
import './App.scss'

interface AppRoutesProps {
  readonly lazyPages: LazySitePages
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function AppRoutes({ lazyPages, setHeaderSearchSlot }: AppRoutesProps) {
  const {
    AboutPage,
    AccessibilityPage,
    ContactPage,
    HelpUsPage,
    PrivacyPage,
    PrivacidadePage,
  } = lazyPages

  return (
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
  )
}

interface AppMainContentProps {
  readonly setHeaderSearchSlot: (slot: ReactNode | null) => void
}

function AppMainContent({ setHeaderSearchSlot }: AppMainContentProps) {
  const location = useLocation()
  const [lazyPages, setLazyPages] = useState(createLazySitePages)

  const refreshLazyPages = (): void => {
    setLazyPages(createLazySitePages())
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <LazyRouteErrorBoundary resetKey={location.pathname} onLazyRetry={refreshLazyPages}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <AppRoutes lazyPages={lazyPages} setHeaderSearchSlot={setHeaderSearchSlot} />
        </Suspense>
      </LazyRouteErrorBoundary>
    </main>
  )
}

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
          <RouteDocumentTitle />
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

          <AppMainContent setHeaderSearchSlot={setHeaderSearchSlot} />

          <Footer />
        </div>
      </RegistryCatalogProvider>
    </CookieConsentProvider>
  )
}

export default App
