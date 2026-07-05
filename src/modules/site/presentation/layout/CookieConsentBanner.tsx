import { useEffect, useId, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import { pushAnalyticsPageView } from '../../application/analytics/analyticsPageView.ts'
import {
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
import { siteRoutes } from '../routes/siteRoutes.ts'
import { useCookieConsent } from '../../application/analytics/cookieConsentContext.ts'

function CookieConsentBanner() {
  const headingId = useId()
  const location = useLocation()
  const { isPreferencesOpen, closeCookiePreferences } = useCookieConsent()
  const [hasChosen, setHasChosen] = useState(() => hasAnalyticsConsentDecision())
  const isVisible = isPreferencesOpen || !hasChosen
  const hasBootstrappedAnalyticsRef = useRef(false)

  useEffect(() => {
    if (hasBootstrappedAnalyticsRef.current) {
      return
    }

    if (getStoredAnalyticsConsent() !== 'accepted') {
      return
    }

    hasBootstrappedAnalyticsRef.current = true
    grantAnalyticsConsent()
    loadGoogleTagManager()
    pushAnalyticsPageView(location.pathname, location.search)
  }, [location.pathname, location.search])

  const handleAccept = () => {
    persistAnalyticsConsent('accepted')
    grantAnalyticsConsent()
    pushConsentUpdateEvent('granted')
    loadGoogleTagManager()
    pushAnalyticsPageView(location.pathname, location.search)
    setHasChosen(true)
    closeCookiePreferences()
  }

  const handleReject = () => {
    persistAnalyticsConsent('rejected')
    denyAllGoogleConsent()
    pushConsentUpdateEvent('denied')
    setHasChosen(true)
    closeCookiePreferences()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="cookie-consent-banner"
      role="region"
      aria-labelledby={headingId}
    >
      <div className="cookie-consent-banner__inner container py-3">
        <h2 id={headingId} className="h6 mb-2">
          Cookie preferences
        </h2>
        <p className="small text-body-secondary mb-3 mb-md-2">
          We use optional analytics cookies to understand how the site is used. You can accept or
          reject analytics. See our{' '}
          <NavLink to={siteRoutes.privacy} className="footer-link">
            Privacy policy
          </NavLink>{' '}
          or{' '}
          <NavLink to={siteRoutes.privacyPt} className="footer-link">
            Política de privacidade
          </NavLink>{' '}
          for details, including your rights in Europe, the United States, and Brazil.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={handleAccept}>
            Accept analytics
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleReject}>
            Reject analytics
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsentBanner
