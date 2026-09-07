import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName.ts'
import { listRepositoryManifestEntries } from '../../application/repositories/repositoryManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes'
import RepositoryCard from '../repositories/RepositoryCard.tsx'

const ORG_CONTRIBUTING_URL = 'https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md'
const ECOSYSTEM_DOC_URL = 'https://github.com/agents-repo/.github/blob/main/docs/ecosystem.md'

function RepositoriesIndexPage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const externalLinkName = useExternalLinkAccessibleName()
  const entries = listRepositoryManifestEntries()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('repositories.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.missionHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('repositories.missionBodyPrefix')}{' '}
                <strong>{t('repositories.missionBodyWebsite')}</strong>{' '}
                {t('repositories.missionBodySuffix')}
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('repositories.architectureHeading')}</h2>
              <p className="text-body-secondary">
                {t('repositories.architectureBodyPrefix')} <strong>registry</strong>{' '}
                {t('repositories.architectureBodyVia')} <strong>registry-proxy</strong>{' '}
                {t('repositories.architectureBodyCaches')} <strong>webapp</strong>{' '}
                {t('repositories.architectureBodyWebapp')} <strong>cli</strong>{' '}
                {t('repositories.architectureBodyFetch')} <strong>.github</strong>.{' '}
                {t('repositories.architectureBodyDeploy')} <strong>GitHub Pages</strong>{' '}
                {t('repositories.architectureBodyFrom')}
              </p>
              <p className="text-body-secondary mb-0">
                {t('repositories.architectureLinkPrefix')}{' '}
                <a
                  href={ECOSYSTEM_DOC_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkName('Ecosystem overview on GitHub')}
                >
                  {t('repositories.ecosystemLink')}
                </a>.
              </p>
            </Card.Body>
          </Card>

          <div>
            <h2 className="h4 mb-3">{t('repositories.organizationHeading')}</h2>
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
              <h2 className="h4">{t('repositories.contributeHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('repositories.contributePrefix')}{' '}
                <a
                  href={ORG_CONTRIBUTING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkName('Organization contributing guide')}
                >
                  {t('repositories.contributingGuide')}
                </a>
                {t('repositories.contributeMiddle')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('repositories.helpUsLink')}</NavLink>
                {t('repositories.contributeAfterHelpUs')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.home)}>{t('repositories.homeLink')}</NavLink>
                {t('repositories.contributeAfterHome')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.docs)}>{t('repositories.docsLink')}</NavLink>{' '}
                {t('repositories.contributeSuffix')}
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default RepositoriesIndexPage
