import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { siteRoutes } from '../routes/siteRoutes'

const CREATOR_GITHUB_URL = 'https://github.com/maiconfz'
const CREATOR_LINKEDIN_URL = 'https://www.linkedin.com/in/maiconfz/'
const WEBAPP_REPO_URL = 'https://github.com/agents-repo/webapp'
const REGISTRY_REPO_URL = 'https://github.com/agents-repo/registry'

function AboutPage() {
  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">About</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">Mission</h2>
              <p className="text-body-secondary mb-0">
                Agents Repo is the web interface for browsing, searching, and downloading curated agents
                and flows from the registry. It helps teams discover maintained packages that are ready for
                direct use in projects, understand package status, and install them for their preferred targets.
              </p>
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">What you can do</h2>
                  <ul className="text-body-secondary mb-0">
                    <li>Browse and search the catalog of agents and flows</li>
                    <li>Filter packages and review status badges</li>
                    <li>Download packages for supported install targets</li>
                    <li>Configure the registry source from Website settings in the header</li>
                    <li>Install the site as an app from the header when your browser supports it</li>
                    <li>Open package sources on GitHub for deeper inspection</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">How it works</h2>
                  <p className="text-body-secondary mb-0">
                    The app loads a registry index from a configurable source URL, applies an app-owned
                    freshness and caching policy, and serves cached catalog data when remote refresh is
                    unavailable. A PWA service worker caches same-origin static assets so the site remains
                    usable offline after the first visit.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <h2 className="h4">Creator</h2>
              <p className="text-body-secondary">
                Agents Repo is created and maintained by Maicon, a senior full stack developer based in
                Portugal, with support from collaborators.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a
                  href={CREATOR_GITHUB_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Maicon on GitHub (opens in a new tab)"
                >
                  <FontAwesomeIcon icon={faGithub} className="me-2" aria-hidden="true" />
                  GitHub
                </a>
                <a
                  href={CREATOR_LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Maicon on LinkedIn (opens in a new tab)"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="me-2" aria-hidden="true" />
                  LinkedIn
                </a>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Get involved</h2>
              <p className="text-body-secondary">
                Questions, feedback, and contributions are welcome. Reach out on{' '}
                <NavLink to={siteRoutes.contact}>Contact</NavLink> or see how to contribute on{' '}
                <NavLink to={siteRoutes.helpUs}>Help Us</NavLink>. Source code and registry content live
                on GitHub:
              </p>
              <ul className="mb-0">
                <li>
                  <a
                    href={WEBAPP_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('agents-repo/webapp repository')}
                  >
                    agents-repo/webapp
                  </a>{' '}
                  — this web application
                </li>
                <li>
                  <a
                    href={REGISTRY_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('agents-repo/registry repository')}
                  >
                    agents-repo/registry
                  </a>{' '}
                  — agents, flows, and registry index
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default AboutPage
