import { Card, Container, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { siteRoutes } from '../routes/siteRoutes'

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
    <main className="py-5">
      <Container>
        <h1 className="h2 mb-4">Help Us</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">Help us grow</h2>
              <p className="text-body-secondary mb-0">
                The project needs <strong>agents and flows packages</strong> most. Browse the catalog on{' '}
                <NavLink to={siteRoutes.home}>Home</NavLink>, then submit maintained packages ready for
                direct use in projects. Questions and feedback are welcome on{' '}
                <NavLink to={siteRoutes.contact}>Contact</NavLink>. Webapp improvements are welcome too.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Create agents and flows</h2>
              <p className="text-body-secondary">
                This is the most valuable way to help right now. Contribute new or improved agent and flow
                packages under <code>packages/</code> in the registry.
              </p>
              <ul className="text-body-secondary">
                <li>
                  Packages should be maintained and ready for direct use, with supported install targets
                  declared in metadata
                </li>
                <li>
                  Supported install targets include GitHub Copilot, Claude Code, Cursor, and OpenAI Codex
                </li>
                <li>
                  Open a package submission issue on the registry, then branch{' '}
                  <code>package/&lt;issue-number&gt;-&lt;slug&gt;</code>
                </li>
                <li>
                  Follow the registry contributing guide for the <code>package:build</code> / validation
                  pipeline and submission requirements
                </li>
                <li>
                  Not sure where to start? Browse examples on <NavLink to={siteRoutes.home}>Home</NavLink>{' '}
                  or ask on <NavLink to={siteRoutes.contact}>Contact</NavLink> before opening a submission
                </li>
              </ul>
              <ul className="mb-0">
                <li>
                  <a href={REGISTRY_REPO_URL} target="_blank" rel="noreferrer noopener">
                    agents-repo/registry
                  </a>{' '}
                  — agents, flows, and registry index
                </li>
                <li>
                  <a href={REGISTRY_CONTRIBUTING_URL} target="_blank" rel="noreferrer noopener">
                    Contributing guide
                  </a>{' '}
                  — package submission workflow and requirements
                </li>
                <li>
                  <a href={REGISTRY_ISSUES_URL} target="_blank" rel="noreferrer noopener">
                    Issues
                  </a>{' '}
                  — package submissions and catalog work
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Improve the webapp</h2>
              <p className="text-body-secondary">
                UI, UX, registry integration, and documentation improvements are welcome, though package
                contributions remain the top priority.
              </p>
              <ul className="text-body-secondary">
                <li>Open a webapp issue before starting tracked work</li>
                <li>
                  Branch: <code>&lt;prefix&gt;/&lt;issue-number&gt;-&lt;slug&gt;</code> (for example{' '}
                  <code>feat/</code> or <code>fix/</code>)
                </li>
                <li>
                  Run validation before requesting review: <code>npm run env:check</code>,{' '}
                  <code>npm run lint:all</code>, <code>npm run test</code>, <code>npm run typecheck</code>, and{' '}
                  <code>npm run build:pages</code>
                </li>
                <li>Open a pull request that closes the tracking issue</li>
              </ul>
              <ul className="mb-0">
                <li>
                  <a href={WEBAPP_REPO_URL} target="_blank" rel="noreferrer noopener">
                    agents-repo/webapp
                  </a>{' '}
                  — this web application
                </li>
                <li>
                  <a href={WEBAPP_CONTRIBUTING_URL} target="_blank" rel="noreferrer noopener">
                    Contributing guide
                  </a>{' '}
                  — branch naming, validation, and PR expectations
                </li>
                <li>
                  <a href={WEBAPP_ISSUES_URL} target="_blank" rel="noreferrer noopener">
                    Issues
                  </a>{' '}
                  — bugs, UI problems, and tracked work
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Support the project</h2>
              <p className="text-body-secondary mb-0">
                <span className="text-body-secondary">Coming soon:</span> financial support through GitHub
                Sponsors, Patreon, and similar platforms. Those options will be linked here once available.
                Package contributions remain the most direct way to help today.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Related</h2>
              <p className="text-body-secondary mb-0">
                Questions and feedback on <NavLink to={siteRoutes.contact}>Contact</NavLink>. Project
                context on <NavLink to={siteRoutes.about}>About</NavLink>.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </main>
  )
}

export default HelpUsPage
