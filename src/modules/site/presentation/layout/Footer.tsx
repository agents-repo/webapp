import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faBoxesStacked,
  faCircleInfo,
  faCodeBranch,
  faEnvelope,
  faHandsHelping,
  faHeart,
  faHouse,
  faScaleBalanced,
  faUniversalAccess,
  faUserShield,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { Col, Container, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'
import { useCookieConsent } from '../../application/analytics/cookieConsentContext'
import { socialLinks } from '../../application/community/socialLinks'
import { localeDefinitions } from '../../application/i18n/supportedLocales.ts'
import { useLocalizedSitePath, useSwitchLocale } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes'
import SocialExternalLink from './SocialExternalLink'

function Footer() {
  const { t } = useTranslation('shell')
  const location = useLocation()
  const localizedSitePath = useLocalizedSitePath()
  const switchLocale = useSwitchLocale()
  const currentPath = `${location.pathname}${location.search}${location.hash}`
  const { openCookiePreferences } = useCookieConsent()
  const externalLinkName = useExternalLinkAccessibleName()

  return (
    <footer className="border-top border-secondary-subtle py-4 py-lg-5 site-footer bg-body-tertiary">
      <Container>
        <Row className="g-3 g-lg-4">
          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">{t('footer.product')}</h2>
            <nav aria-label={`Footer: ${t('footer.product')}`}>
              <div className="d-flex flex-column gap-2">
                <NavLink to={localizedSitePath(siteRoutes.home)} className="footer-link">
                  <FontAwesomeIcon icon={faHouse} className="me-2" aria-hidden="true" />
                  {t('footer.home')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.packages)} className="footer-link">
                  <FontAwesomeIcon icon={faBoxesStacked} className="me-2" aria-hidden="true" />
                  {t('nav.packages')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.about)} className="footer-link">
                  <FontAwesomeIcon icon={faCircleInfo} className="me-2" aria-hidden="true" />
                  {t('nav.about')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.community)} className="footer-link">
                  <FontAwesomeIcon icon={faUsers} className="me-2" aria-hidden="true" />
                  {t('nav.community')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.docs)} className="footer-link">
                  <FontAwesomeIcon icon={faBook} className="me-2" aria-hidden="true" />
                  {t('nav.docs')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.repositories)} className="footer-link">
                  <FontAwesomeIcon icon={faCodeBranch} className="me-2" aria-hidden="true" />
                  {t('footer.repositories')}
                </NavLink>
              </div>
            </nav>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">{t('footer.connect')}</h2>
            <nav aria-label={`Footer: ${t('footer.connect')}`}>
              <div className="d-flex flex-column gap-2">
                <NavLink to={localizedSitePath(siteRoutes.contact)} className="footer-link">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" aria-hidden="true" />
                  {t('nav.contact')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.helpUs)} className="footer-link">
                  <FontAwesomeIcon icon={faHandsHelping} className="me-2" aria-hidden="true" />
                  {t('nav.helpUs')}
                </NavLink>
                {socialLinks.map((entry) => (
                  <SocialExternalLink key={entry.id} entry={entry} className="footer-link" />
                ))}
              </div>
            </nav>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">{t('footer.legal')}</h2>
            <nav aria-label={`Footer: ${t('footer.legal')}`}>
              <div className="d-flex flex-column gap-2 mb-3">
                <NavLink to={localizedSitePath(siteRoutes.accessibility)} className="footer-link">
                  <FontAwesomeIcon icon={faUniversalAccess} className="me-2" aria-hidden="true" />
                  {t('footer.accessibility')}
                </NavLink>
                <NavLink to={localizedSitePath(siteRoutes.privacy)} className="footer-link">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" aria-hidden="true" />
                  {t('footer.privacy')}
                </NavLink>
                <button type="button" className="btn btn-link footer-link text-start p-0 border-0" onClick={openCookiePreferences}>
                  {t('footer.cookiePreferences')}
                </button>
              </div>
              <p className="mb-0 small text-body-secondary footer-note">
                <FontAwesomeIcon icon={faScaleBalanced} className="me-2" aria-hidden="true" />
                {t('footer.licensedUnder')}{' '}
                <a
                  className="footer-link"
                  href="https://github.com/agents-repo/webapp/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkName(t('footer.mitLicense'))}
                >
                  MIT
                </a>.
              </p>
            </nav>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">{t('footer.language')}</h2>
            <nav aria-label={`Footer: ${t('footer.language')}`}>
              <div className="d-flex flex-column gap-2">
                {localeDefinitions.map((definition) => (
                  <button
                    key={definition.id}
                    type="button"
                    className="btn btn-link footer-link text-start p-0 border-0"
                    onClick={() => {
                      switchLocale(definition.id, currentPath)
                    }}
                  >
                    {definition.displayName}
                  </button>
                ))}
              </div>
            </nav>
          </Col>
        </Row>

        <Row className="mt-4 mt-lg-5">
          <Col>
            <div className="footer-credits-row">
              <p className="mb-0 text-body-secondary text-center">
                {t('footer.madeWith')}{' '}
                <FontAwesomeIcon icon={faHeart} className="text-danger mx-1" aria-hidden="true" />{' '}
                <NavLink to={localizedSitePath(siteRoutes.community)} className="footer-link">
                  {t('footer.byCollaborators')}
                </NavLink>.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
