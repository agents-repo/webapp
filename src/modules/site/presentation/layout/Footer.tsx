import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleInfo,
  faEnvelope,
  faHandsHelping,
  faHeart,
  faHouse,
  faScaleBalanced,
  faUniversalAccess,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { siteRoutes } from '../routes/siteRoutes'
import { useCookieConsent } from '../../application/analytics/cookieConsentContext'

function Footer() {
  const { openCookiePreferences } = useCookieConsent()

  return (
    <footer className="border-top border-secondary-subtle py-4 py-lg-5 site-footer bg-body-tertiary">
      <Container>
        <Row className="g-3 g-lg-4">
          <Col sm={6} lg={4}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Product</h2>
            <nav aria-label="Footer: Product">
              <div className="d-flex flex-column gap-2">
                <NavLink to={siteRoutes.home} className="footer-link">
                  <FontAwesomeIcon icon={faHouse} className="me-2" aria-hidden="true" />
                  Home
                </NavLink>
                <NavLink to={siteRoutes.about} className="footer-link">
                  <FontAwesomeIcon icon={faCircleInfo} className="me-2" aria-hidden="true" />
                  About
                </NavLink>
              </div>
            </nav>
          </Col>

          <Col sm={6} lg={4}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Connect</h2>
            <nav aria-label="Footer: Connect">
              <div className="d-flex flex-column gap-2">
                <NavLink to={siteRoutes.contact} className="footer-link">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" aria-hidden="true" />
                  Contact
                </NavLink>
                <NavLink to={siteRoutes.helpUs} className="footer-link">
                  <FontAwesomeIcon icon={faHandsHelping} className="me-2" aria-hidden="true" />
                  Help Us
                </NavLink>
              </div>
            </nav>
          </Col>

          <Col sm={6} lg={4}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Legal</h2>
            <nav aria-label="Footer: Legal">
              <div className="d-flex flex-column gap-2 mb-3">
                <NavLink to={siteRoutes.accessibility} className="footer-link">
                  <FontAwesomeIcon icon={faUniversalAccess} className="me-2" aria-hidden="true" />
                  Accessibility
                </NavLink>
                <NavLink to={siteRoutes.privacy} className="footer-link">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" aria-hidden="true" />
                  Privacy
                </NavLink>
                <NavLink to={siteRoutes.privacyPtBr} className="footer-link">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" aria-hidden="true" />
                  Privacidade
                </NavLink>
                <button type="button" className="btn btn-link footer-link text-start p-0 border-0" onClick={openCookiePreferences}>
                  Cookie preferences
                </button>
              </div>
              <p className="mb-0 small text-body-secondary footer-note">
                <FontAwesomeIcon icon={faScaleBalanced} className="me-2" aria-hidden="true" />
                Licensed under{' '}
                <a
                  className="footer-link"
                  href="https://github.com/agents-repo/webapp/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkAccessibleName('MIT license')}
                >
                  MIT
                </a>.
              </p>
            </nav>
          </Col>
        </Row>

        <Row className="mt-4 mt-lg-5">
          <Col>
            <div className="footer-credits-row">
              <p className="mb-0 text-body-secondary text-center">
                Made with <FontAwesomeIcon icon={faHeart} className="text-danger mx-1" aria-hidden="true" /> by
                Maicon + collaborators.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
