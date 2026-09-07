import { useEffect, useId, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { pushAnalyticsPageView } from '../../application/analytics/analyticsPageView.ts'
import {
  analyticsConsentStorageKeyForDocs,
  getStoredAnalyticsConsent,
  hasAnalyticsConsentDecision,
  persistAnalyticsConsent,
} from '../../application/analytics/cookieConsent.ts'
import {
  denyAllGoogleConsent,
  grantAnalyticsConsent,
  pushConsentUpdateEvent,
} from '../../application/analytics/googleConsentMode.ts'
import { loadGoogleTagManager } from '../../application/analytics/googleTagManager.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'
import { useCookieConsent } from '../../application/analytics/cookieConsentContext.ts'

function CookieConsentBanner() {
  const { t } = useTranslation('shell')
  const localizedSitePath = useLocalizedSitePath()
  const headingId = useId()
  const location = useLocation()
  const { isPreferencesOpen, closeCookiePreferences } = useCookieConsent()
  const [consentRenderGeneration, setConsentRenderGeneration] = useState(0)
  const hasChosen = hasAnalyticsConsentDecision()
  const isVisible = isPreferencesOpen || !hasChosen
  const hasBootstrappedAnalyticsRef = useRef(false)

  const bumpConsentSnapshot = () => {
    setConsentRenderGeneration((currentValue) => currentValue + 1)
  }

  useEffect(() => {
    const syncConsentChoice = (event: StorageEvent) => {
      if (event.key !== null && event.key !== analyticsConsentStorageKeyForDocs) {
        return
      }

      setConsentRenderGeneration((currentValue) => currentValue + 1)
    }

    globalThis.addEventListener('storage', syncConsentChoice)
    return () => {
      globalThis.removeEventListener('storage', syncConsentChoice)
    }
  }, [])

  useEffect(() => {
    if (hasBootstrappedAnalyticsRef.current) {
      return
    }

    if (getStoredAnalyticsConsent() !== 'accepted') {
      return
    }

    hasBootstrappedAnalyticsRef.current = true
    grantAnalyticsConsent()
    pushConsentUpdateEvent('granted')
    loadGoogleTagManager()
    pushAnalyticsPageView(location.pathname, location.search)
  }, [location.pathname, location.search])

  const handleAccept = () => {
    const wasAlreadyAccepted = getStoredAnalyticsConsent() === 'accepted'

    persistAnalyticsConsent('accepted')

    if (!wasAlreadyAccepted) {
      grantAnalyticsConsent()
      pushConsentUpdateEvent('granted')
      loadGoogleTagManager()
      pushAnalyticsPageView(location.pathname, location.search)
      hasBootstrappedAnalyticsRef.current = true
    }

    bumpConsentSnapshot()
    closeCookiePreferences()
  }

  const handleReject = () => {
    persistAnalyticsConsent('rejected')
    denyAllGoogleConsent()
    pushConsentUpdateEvent('denied')
    bumpConsentSnapshot()
    closeCookiePreferences()
  }

  if (!isVisible) {
    return null
  }

  return (
    <section
      key={consentRenderGeneration}
      className="cookie-consent-banner"
      aria-labelledby={headingId}
    >
      <div className="cookie-consent-banner__inner container py-3">
        <h2 id={headingId} className="h6 mb-2">
          {t('cookieBanner.title')}
        </h2>
        <p className="small text-body-secondary mb-3 mb-md-2">
          {t('cookieBanner.descriptionBefore')}
          <NavLink to={localizedSitePath(siteRoutes.privacy)} className="footer-link">
            {t('cookieBanner.privacyLink')}
          </NavLink>
          {t('cookieBanner.descriptionAfter')}
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="outline-primary" size="sm" onClick={handleAccept}>
            {t('cookieBanner.accept')}
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleReject}>
            {t('cookieBanner.reject')}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CookieConsentBanner
