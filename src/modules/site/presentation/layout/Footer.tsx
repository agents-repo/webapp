import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleInfo,
  faEnvelope,
  faHandsHelping,
  faHeart,
  faScaleBalanced,
} from '@fortawesome/free-solid-svg-icons'
import { Col, Container, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { siteRoutes } from '../routes/siteRoutes'

function Footer() {
  return (
    <footer className="border-top border-secondary-subtle py-4 py-lg-5 site-footer">
      <Container>
        <Row className="g-3 g-lg-4">
          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Product</h2>
            <div className="d-flex flex-column gap-2">
              <NavLink to={siteRoutes.home} className="footer-link">Home</NavLink>
              <NavLink to={siteRoutes.about} className="footer-link">About</NavLink>
            </div>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Connect</h2>
            <div className="d-flex flex-column gap-2">
              <NavLink to={siteRoutes.contact} className="footer-link">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Contact
              </NavLink>
              <NavLink to={siteRoutes.helpUs} className="footer-link">
                <FontAwesomeIcon icon={faHandsHelping} className="me-2" />
                Help Us
              </NavLink>
            </div>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Legal</h2>
            <p className="mb-0 small text-body-secondary footer-note">
              <FontAwesomeIcon icon={faScaleBalanced} className="me-2" />
              Licensed under{' '}
              <a
                className="footer-link"
                href="https://github.com/agents-repo/webapp/blob/main/LICENSE"
                target="_blank"
                rel="noreferrer"
              >
                MIT
              </a>
              .
            </p>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="h6 text-uppercase text-body-secondary mb-3 footer-column-title">Credits</h2>
            <p className="mb-0 small text-body-secondary footer-note">
              Made with <FontAwesomeIcon icon={faHeart} className="text-danger mx-1" /> by
              Maicon + GitHub Copilot and collaborators.
            </p>
            <p className="mb-0 mt-2 small text-body-secondary footer-note">
              <FontAwesomeIcon icon={faCircleInfo} className="me-2" />
              Registry template preview.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
