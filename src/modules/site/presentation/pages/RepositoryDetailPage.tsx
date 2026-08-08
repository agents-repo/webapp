import { Badge, Card, Container, Stack } from 'react-bootstrap'
import { Navigate, NavLink, useParams } from 'react-router-dom'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink.ts'
import { getRepositoryBySlug } from '../../application/repositories/repositoryManifest.ts'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'

function RepositoryLinkList({ entry }: { readonly entry: RepositoryManifestEntry }) {
  const links: { href: string; label: string }[] = [
    { href: entry.repository, label: `${entry.name} on GitHub` },
    { href: entry.contributing, label: 'Contributing guide' },
    { href: entry.issues, label: 'Issues' },
  ]

  if (entry.discussions) {
    links.push({ href: entry.discussions, label: 'Discussions' })
  }

  if (entry.security) {
    links.push({ href: entry.security, label: 'Security' })
  }

  return (
    <ul className="mb-0">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={externalLinkAccessibleName(link.label)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function RepositoryDetailPage() {
  const { slug } = useParams()
  const entry = slug ? getRepositoryBySlug(slug) : undefined

  if (!entry) {
    return <Navigate to={siteRoutes.repositories} replace />
  }

  return (
    <div className="py-5">
      <Container>
        <p className="mb-3">
          <NavLink to={siteRoutes.repositories}>← All repositories</NavLink>
        </p>

        <Stack gap={4}>
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h1 className="h2 mb-0">{entry.name}</h1>
              <Badge bg="secondary" className="text-uppercase">
                {entry.role}
              </Badge>
            </div>
            <p className="text-body-secondary mb-0">{entry.description}</p>
          </div>

          <Card>
            <Card.Body>
              <h2 className="h4">Relationship</h2>
              <p className="text-body-secondary mb-0">{entry.relationship}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Quick links</h2>
              <RepositoryLinkList entry={entry} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Stack and tags</h2>
              <p className="text-body-secondary">
                <strong>Stack:</strong> {entry.stack.join(', ')}
              </p>
              <div className="d-flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <Badge key={tag} bg="light" text="dark" className="fw-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Audience</h2>
              <p className="text-body-secondary mb-0">{entry.audience}</p>
            </Card.Body>
          </Card>

          {entry.quickstart ? (
            <Card>
              <Card.Body>
                <h2 className="h4">Quickstart</h2>
                <pre className="mb-0">
                  <code>{entry.quickstart}</code>
                </pre>
              </Card.Body>
            </Card>
          ) : null}

          <Card>
            <Card.Body>
              <h2 className="h4">Guide</h2>
              {entry.guideLinks && entry.guideLinks.length > 0 ? (
                <ul className="mb-0">
                  {entry.guideLinks.map((link) => (
                    <li key={link.path}>
                      <NavLink to={link.path}>{link.label}</NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-secondary mb-0">
                  Site guide pages at <code>/guide</code> are coming soon. Until then, use the contributing
                  guide and README on GitHub.
                </p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Canonical site URL</h2>
              <p className="text-body-secondary mb-0">
                Use <code>{entry.homepage}</code> as the GitHub repository <strong>Website</strong> field.
                Slugs under <code>/repositories/</code> are stable and must not be renamed after publish.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default RepositoryDetailPage
