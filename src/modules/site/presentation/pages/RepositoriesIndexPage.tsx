import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink.ts'
import { listRepositoryManifestEntries } from '../../application/repositories/repositoryManifest.ts'
import { publicSitePath, siteRoutes } from '../routes/siteRoutes'
import RepositoryCard from '../repositories/RepositoryCard.tsx'

const ORG_CONTRIBUTING_URL = 'https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md'
const ECOSYSTEM_DOC_URL = 'https://github.com/agents-repo/.github/blob/main/docs/ecosystem.md'

function RepositoriesIndexPage() {
  const entries = listRepositoryManifestEntries()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">Repositories</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">Mission</h2>
              <p className="text-body-secondary mb-0">
                The agents-repo organization maintains specifications, packages, and applications for
                discovering, validating, and distributing agents and flows for GitHub Copilot, Cursor,
                Claude Code, and OpenAI Codex. This site is the public face of that ecosystem; each
                repository below has a stable page you can use as the GitHub <strong>Website</strong> field
                for that project.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Architecture overview</h2>
              <p className="text-body-secondary">
                Contributors publish packages to <strong>registry</strong> via pull request.{' '}
                <strong>registry-proxy</strong> caches read access to registry files on GitHub.{' '}
                <strong>webapp</strong> (this site) and <strong>cli</strong> fetch catalog data through the
                proxy by default. Organization policies and shared workflow live in <strong>.github</strong>.
                Production builds deploy to <strong>GitHub Pages</strong> from the webapp pipeline.
              </p>
              <p className="text-body-secondary mb-0">
                Step-by-step diagrams and flows:{' '}
                <a
                  href={ECOSYSTEM_DOC_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkAccessibleName('Ecosystem overview on GitHub')}
                >
                  Ecosystem overview on GitHub
                </a>.
              </p>
            </Card.Body>
          </Card>

          <div>
            <h2 className="h4 mb-3">Organization repositories</h2>
            <Row className="g-4">
              {entries.map((entry) => (
                <Col key={entry.slug} md={6} lg={4}>
                  <RepositoryCard entry={entry} />
                </Col>
              ))}
            </Row>
          </div>

          <Card>
            <Card.Body>
              <h2 className="h4">Contribute</h2>
              <p className="text-body-secondary mb-0">
                Start with the organization{' '}
                <a
                  href={ORG_CONTRIBUTING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkAccessibleName('Organization contributing guide')}
                >
                  contributing guide
                </a>
                , see how to help on <NavLink to={publicSitePath(siteRoutes.helpUs)}>Help Us</NavLink>, or browse package
                ideas on <NavLink to={publicSitePath(siteRoutes.home)}>Home</NavLink>. Read the site{' '}
                <NavLink to={publicSitePath(siteRoutes.docs)}>Docs</NavLink> for catalog, CLI, and contribution docs.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default RepositoriesIndexPage
