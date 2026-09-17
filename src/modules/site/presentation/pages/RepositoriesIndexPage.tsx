import { Card, Container, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ECOSYSTEM_DOC_URL, ORG_CONTRIBUTING_URL } from '../../application/community/githubProjectUrls.ts'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName.ts'
import { listRepositoryManifestEntries } from '../../application/repositories/repositoryManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes'
import RepositoryCardGrid from '../repositories/RepositoryCardGrid.tsx'

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
                  aria-label={externalLinkName(t('repositories.ecosystemLinkAriaLabel'))}
                >
                  {t('repositories.ecosystemLink')}
                </a>.
              </p>
            </Card.Body>
          </Card>

          <div>
            <h2 className="h4 mb-3">{t('repositories.organizationHeading')}</h2>
            <RepositoryCardGrid entries={entries} />
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
                  aria-label={externalLinkName(t('repositories.contributingGuideAriaLabel'))}
                >
                  {t('repositories.contributingGuide')}
                </a>
                {t('repositories.contributeMiddle')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.contribute)}>{t('repositories.contributeLink')}</NavLink>
                {t('repositories.contributeAfterContribute')}{' '}
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
