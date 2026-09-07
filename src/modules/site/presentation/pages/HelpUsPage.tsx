import { Card, Container, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDocDetailPath } from '../../application/docs/docsManifest.ts'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
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
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const externalLinkName = useExternalLinkAccessibleName()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('helpUs.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">{t('helpUs.growHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('helpUs.growBodyPrefix')}{' '}
                <strong>{t('helpUs.growBodyPackages')}</strong> {t('helpUs.growBodyMiddle')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.home)}>{t('helpUs.homeLink')}</NavLink>
                {t('helpUs.growBodyAfterHome')}{' '}
                <NavLink to={localizedSitePath(getDocDetailPath('submitting-a-package'))}>
                  {t('helpUs.submissionGuideLink')}
                </NavLink>
                {t('helpUs.growBodyAfterGuide')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.docs)}>{t('helpUs.docsLink')}</NavLink>
                {t('helpUs.growBodyAfterDocs')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.contact)}>{t('helpUs.contactLink')}</NavLink>
                {t('helpUs.growBodySuffix')}
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('helpUs.createPackagesHeading')}</h2>
              <p className="text-body-secondary">
                {t('helpUs.createPackagesBodyPrefix')}{' '}
                <a
                  href={REGISTRY_REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkName('agents-repo/registry repository')}
                >
                  agents-repo/registry
                </a>
                {t('helpUs.createPackagesBodyMiddle')} <code>packages/</code>
                {t('helpUs.createPackagesBodyAfterPackages')}{' '}
                <NavLink to={localizedSitePath(getDocDetailPath('submitting-a-package'))}>
                  {t('helpUs.submitPackageLink')}
                </NavLink>{' '}
                {t('helpUs.createPackagesBodyAnd')}{' '}
                <NavLink to={localizedSitePath(getDocDetailPath('contributing-packages'))}>
                  {t('helpUs.contributingPackagesLink')}
                </NavLink>
                {t('helpUs.createPackagesBodySuffix')}
              </p>
              <ul className="mb-0">
                <li>
                  <a
                    href={REGISTRY_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkName('agents-repo/registry repository')}
                  >
                    agents-repo/registry
                  </a>
                </li>
                <li>
                  <a
                    href={REGISTRY_CONTRIBUTING_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkName('Registry contributing guide')}
                  >
                    {t('helpUs.contributingGuide')}
                  </a>
                </li>
                <li>
                  <a
                    href={REGISTRY_ISSUES_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkName('Registry issues')}
                  >
                    {t('contact.issues')}
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('helpUs.improveWebappHeading')}</h2>
              <p className="text-body-secondary">
                {t('helpUs.improveWebappBodyPrefix')}{' '}
                <NavLink to={localizedSitePath(getDocDetailPath('contributing-to-webapp'))}>
                  {t('helpUs.contributingWebappLink')}
                </NavLink>{' '}
                {t('helpUs.improveWebappBodySuffix')}
              </p>
              <ul className="mb-0">
                <li>
                  <a
                    href={WEBAPP_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkName('agents-repo/webapp repository')}
                  >
                    agents-repo/webapp
                  </a>
                </li>
                <li>
                  <a
                    href={WEBAPP_CONTRIBUTING_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkName('Webapp contributing guide')}
                  >
                    {t('helpUs.contributingGuide')}
                  </a>
                </li>
                <li>
                  <a
                    href={WEBAPP_ISSUES_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkName('Webapp issues')}
                  >
                    {t('contact.issues')}
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('helpUs.supportHeading')}</h2>
              <p className="text-body-secondary mb-0">
                <span className="text-body-secondary">{t('helpUs.supportComingSoon')}</span>{' '}
                {t('helpUs.supportBody')}
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('helpUs.relatedHeading')}</h2>
              <p className="text-body-secondary mb-0">
                <NavLink to={localizedSitePath(siteRoutes.community)}>{t('helpUs.communityLink')}</NavLink>,{' '}
                <NavLink to={localizedSitePath(siteRoutes.docs)}>{t('helpUs.docsLink')}</NavLink>,{' '}
                {t('helpUs.relatedRepositoriesOn')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.repositories)}>{t('helpUs.repositoriesLink')}</NavLink>,{' '}
                {t('helpUs.relatedQuestionsOn')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.contact)}>{t('helpUs.contactLink')}</NavLink>,{' '}
                {t('helpUs.relatedContextOn')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.about)}>{t('helpUs.aboutLink')}</NavLink>.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default HelpUsPage
