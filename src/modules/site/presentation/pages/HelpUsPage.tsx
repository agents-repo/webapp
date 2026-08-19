import { Card, Container, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { getDocDetailPath } from '../../application/docs/docsManifest.ts'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { publicSitePath, siteRoutes } from '../routes/siteRoutes'

const REGISTRY_REPO_URL = 'https://github.com/agents-repo/registry'
const REGISTRY_CONTRIBUTING_URL =
  'https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md'
const REGISTRY_ISSUES_URL = 'https://github.com/agents-repo/registry/issues'
const WEBAPP_REPO_URL = 'https://github.com/agents-repo/webapp'
const WEBAPP_CONTRIBUTING_URL =
  'https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md'
const WEBAPP_ISSUES_URL = 'https://github.com/agents-repo/webapp/issues'

function HelpUsPage() {
  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">Help Us</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">Help us grow</h2>
              <p className="text-body-secondary mb-0">
                The project needs <strong>agents and flows packages</strong> most. Browse the catalog on{' '}
                <NavLink to={publicSitePath(siteRoutes.home)}>Home</NavLink>, then follow the{' '}
                <NavLink to={publicSitePath(getDocDetailPath('submitting-a-package'))}>package submission guide</NavLink>.
                Step-by-step docs live in <NavLink to={publicSitePath(siteRoutes.docs)}>Docs</NavLink>. Questions and
                feedback are welcome on <NavLink to={publicSitePath(siteRoutes.contact)}>Contact</NavLink>.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Create agents and flows</h2>
              <p className="text-body-secondary">
                Fork <a
                  href={REGISTRY_REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkAccessibleName('agents-repo/registry repository')}
                >
                  agents-repo/registry
                </a>, add maintained packages under <code>packages/</code>, and open a pull request from your
                fork to upstream. Start with{' '}
                <NavLink to={publicSitePath(getDocDetailPath('submitting-a-package'))}>Submit a package</NavLink> and{' '}
                <NavLink to={publicSitePath(getDocDetailPath('contributing-packages'))}>Contributing packages</NavLink>.
              </p>
              <ul className="mb-0">
                <li>
                  <a
                    href={REGISTRY_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('agents-repo/registry repository')}
                  >
                    agents-repo/registry
                  </a>
                </li>
                <li>
                  <a
                    href={REGISTRY_CONTRIBUTING_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('Registry contributing guide')}
                  >
                    Contributing guide
                  </a>
                </li>
                <li>
                  <a
                    href={REGISTRY_ISSUES_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('Registry issues')}
                  >
                    Issues
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Improve the webapp</h2>
              <p className="text-body-secondary">
                UI, UX, registry integration, and site docs are welcome. See{' '}
                <NavLink to={publicSitePath(getDocDetailPath('contributing-to-webapp'))}>Contributing to webapp</NavLink>{' '}
                for workflow and validation commands.
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
                  </a>
                </li>
                <li>
                  <a
                    href={WEBAPP_CONTRIBUTING_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('Webapp contributing guide')}
                  >
                    Contributing guide
                  </a>
                </li>
                <li>
                  <a
                    href={WEBAPP_ISSUES_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('Webapp issues')}
                  >
                    Issues
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Support the project</h2>
              <p className="text-body-secondary mb-0">
                <span className="text-body-secondary">Coming soon:</span> financial support through GitHub
                Sponsors, Patreon, and similar platforms. Package contributions remain the most direct way
                to help today.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Related</h2>
              <p className="text-body-secondary mb-0">
                <NavLink to={publicSitePath(siteRoutes.community)}>Community</NavLink>,{' '}
                <NavLink to={publicSitePath(siteRoutes.docs)}>Docs</NavLink>, organization repositories on{' '}
                <NavLink to={publicSitePath(siteRoutes.repositories)}>Repositories</NavLink>, questions on{' '}
                <NavLink to={publicSitePath(siteRoutes.contact)}>Contact</NavLink>, and context on{' '}
                <NavLink to={publicSitePath(siteRoutes.about)}>About</NavLink>.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default HelpUsPage
