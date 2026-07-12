import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { siteRoutes } from '../routes/siteRoutes'

const WEBAPP_DISCUSSIONS_URL = 'https://github.com/agents-repo/webapp/discussions'
const WEBAPP_ISSUES_URL = 'https://github.com/agents-repo/webapp/issues'
const REGISTRY_DISCUSSIONS_URL = 'https://github.com/agents-repo/registry/discussions'
const REGISTRY_ISSUES_URL = 'https://github.com/agents-repo/registry/issues'
const CREATOR_GITHUB_URL = 'https://github.com/maiconfz'
const CREATOR_LINKEDIN_URL = 'https://www.linkedin.com/in/maiconfz/'

function ContactPage() {
  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">Contact</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">Reach out</h2>
              <p className="text-body-secondary mb-0">
                Use this page to find the right channel for questions about packages, registry usage,
                webapp behavior, and contribution workflows. For registry source configuration, check
                Website settings in the header before opening a thread.
              </p>
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">Webapp</h2>
                  <p className="text-body-secondary">
                    For this site: usage questions, UI behavior, registry integration, and tracked
                    feature or bug work.
                  </p>
                  <ul className="mb-0">
                    <li>
                      <a
                        href={WEBAPP_DISCUSSIONS_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Webapp discussions')}
                      >
                        Discussions
                      </a>{' '}
                      — usage questions and open-ended help
                    </li>
                    <li>
                      <a
                        href={WEBAPP_ISSUES_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Webapp issues')}
                      >
                        Issues
                      </a>{' '}
                      — bugs, UI problems, and tracked work
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">Registry</h2>
                  <p className="text-body-secondary">
                    For agents, flows, and catalog content: usage questions, package ideas, submissions,
                    and index problems.
                  </p>
                  <ul className="mb-0">
                    <li>
                      <a
                        href={REGISTRY_DISCUSSIONS_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Registry discussions')}
                      >
                        Discussions
                      </a>{' '}
                      — usage questions and package ideas
                    </li>
                    <li>
                      <a
                        href={REGISTRY_ISSUES_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Registry issues')}
                      >
                        Issues
                      </a>{' '}
                      — package submissions, catalog problems, and tracked work
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <h2 className="h4">Creator</h2>
              <p className="text-body-secondary">
                Maicon is the creator and maintainer of Agents Repo, a senior full stack developer based
                in Portugal, with support from collaborators.
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
              <h2 className="h4">Before you write</h2>
              <p className="text-body-secondary">
                Discussions work well with lighter context. For issues, include enough detail to reproduce
                or route the request:
              </p>
              <ul className="text-body-secondary mb-0">
                <li>Package id and install target, when relevant</li>
                <li>Registry source settings from Website settings, if catalog-related</li>
                <li>Steps to reproduce and expected vs actual behavior</li>
                <li>Browser and environment, for webapp bugs</li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Related</h2>
              <p className="text-body-secondary mb-0">
                See how to contribute on <NavLink to={siteRoutes.helpUs}>Help Us</NavLink> or read more
                about the project on <NavLink to={siteRoutes.about}>About</NavLink>.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default ContactPage
