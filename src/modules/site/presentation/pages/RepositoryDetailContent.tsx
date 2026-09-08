import { Badge, Card, Container, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName.ts'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'
import { useLocalizedRepositoryEntry } from '../repositories/useLocalizedRepositoryEntry.ts'

function RepositoryLinkList({ entry }: { readonly entry: RepositoryManifestEntry }) {
  const { t } = useTranslation('pages')
  const externalLinkName = useExternalLinkAccessibleName()
  const links: { href: string; label: string }[] = [
    {
      href: entry.repository,
      label: t('repositories.detail.onGitHub', { name: entry.name }),
    },
    { href: entry.contributing, label: t('repositories.detail.contributingGuide') },
    { href: entry.issues, label: t('repositories.detail.issues') },
  ]

  if (entry.discussions) {
    links.push({ href: entry.discussions, label: t('repositories.detail.discussions') })
  }

  if (entry.security) {
    links.push({ href: entry.security, label: t('repositories.detail.security') })
  }

  return (
    <ul className="mb-0">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={externalLinkName(link.label)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function RepositoryDetailContent({ entry }: { readonly entry: RepositoryManifestEntry }) {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const localized = useLocalizedRepositoryEntry(entry)

  return (
    <div className="py-5">
      <Container>
        <p className="mb-3">
          <NavLink to={localizedSitePath(siteRoutes.repositories)}>
            {t('repositories.detail.backLink')}
          </NavLink>
        </p>

        <Stack gap={4}>
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h1 className="h2 mb-0">{entry.name}</h1>
              <Badge bg="secondary" className="text-uppercase">
                {localized.roleLabel}
              </Badge>
            </div>
            <p className="text-body-secondary mb-0">{localized.description}</p>
          </div>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.detail.relationshipHeading')}</h2>
              <p className="text-body-secondary mb-0">{localized.relationship}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.detail.quickLinksHeading')}</h2>
              <RepositoryLinkList entry={entry} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.detail.stackHeading')}</h2>
              <p className="text-body-secondary">
                <strong>{t('repositories.detail.stackLabel')}</strong> {entry.stack.join(', ')}
              </p>
              <div className="d-flex flex-wrap gap-1">
                {entry.tags.map((tag, index) => (
                  <Badge key={tag} bg="light" text="dark" className="fw-normal">
                    {localized.tags[index]}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.detail.audienceHeading')}</h2>
              <p className="text-body-secondary mb-0">{localized.audience}</p>
            </Card.Body>
          </Card>

          {entry.quickstart ? (
            <Card>
              <Card.Body>
                <h2 className="h4">{t('repositories.detail.quickstartHeading')}</h2>
                <pre className="mb-0">
                  <code>{entry.quickstart}</code>
                </pre>
              </Card.Body>
            </Card>
          ) : null}

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.detail.docsHeading')}</h2>
              {localized.docLinks.length > 0 ? (
                <ul className="mb-0">
                  {localized.docLinks.map((link) => (
                    <li key={link.path}>
                      <NavLink to={localizedSitePath(link.path)}>{link.label}</NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-secondary mb-0">
                  {t('repositories.detail.docsFallbackPrefix')}{' '}
                  <NavLink to={localizedSitePath(siteRoutes.docs)}>
                    {t('repositories.detail.docsFallbackDocsLink')}
                  </NavLink>
                  {t('repositories.detail.docsFallbackMiddle')}{' '}
                  <NavLink to={localizedSitePath('/docs/installing-packages')}>
                    {t('repositories.detail.docsFallbackInstallingPackages')}
                  </NavLink>{' '}
                  {t('repositories.detail.docsFallbackAnd')}{' '}
                  <NavLink to={localizedSitePath('/docs/cli-commands')}>
                    {t('repositories.detail.docsFallbackCliCommands')}
                  </NavLink>
                  {t('repositories.detail.docsFallbackSuffix')}
                </p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.detail.canonicalHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('repositories.detail.canonicalBodyPrefix')}{' '}
                <code>{entry.homepage}</code> {t('repositories.detail.canonicalBodyAsGithubRepo')}{' '}
                <strong>{t('repositories.detail.canonicalBodyWebsite')}</strong>{' '}
                {t('repositories.detail.canonicalBodyFieldSuffix')}{' '}
                {t('repositories.detail.canonicalBodyMiddle')}{' '}
                <code>/repositories/</code> {t('repositories.detail.canonicalBodySuffix')}
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default RepositoryDetailContent
