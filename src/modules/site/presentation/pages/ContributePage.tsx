import { Card, Col, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ORG_CONTRIBUTING_URL, ORG_ROADMAP_URL } from '../../application/community/githubProjectUrls.ts'
import { listRepositoryManifestEntries } from '../../application/repositories/repositoryManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import ExternalLink from '../layout/ExternalLink'
import ExternalLinkListItem from '../layout/ExternalLinkListItem'
import SitePageLayout from '../layout/SitePageLayout'
import { siteRoutes } from '../routes/siteRoutes'
import RepositoryCardGrid from '../repositories/RepositoryCardGrid.tsx'
import {
  contributeWayIds,
  contributeWayLinks,
  type ContributeWayLink,
} from './contributeWayLinks.ts'

function ContributeWayLinkItem({
  link,
  localizedSitePath,
}: {
  readonly link: ContributeWayLink
  readonly localizedSitePath: (path: string) => string
}) {
  const { t } = useTranslation('pages')

  if (link.kind === 'external') {
    return (
      <ExternalLinkListItem href={link.href} accessibleLabel={t(link.ariaLabelKey)}>
        {t(link.labelKey)}
      </ExternalLinkListItem>
    )
  }

  return (
    <li>
      <NavLink to={localizedSitePath(link.route)}>{t(link.labelKey)}</NavLink>
    </li>
  )
}

function ContributePage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const entries = listRepositoryManifestEntries()

  return (
    <SitePageLayout title={t('contribute.title')}>
      <Card>
        <Card.Body>
          <h2 className="h4">{t('contribute.introHeading')}</h2>
          <p className="text-body-secondary mb-0">
            {t('contribute.introBodyPrefix')}{' '}
            <ExternalLink href={ORG_CONTRIBUTING_URL} accessibleLabel={t('contribute.introContributingAriaLabel')}>
              {t('contribute.introContributingLink')}
            </ExternalLink>
            {t('contribute.introMiddle')}{' '}
            <ExternalLink href={ORG_ROADMAP_URL} accessibleLabel={t('contribute.introRoadmapAriaLabel')}>
              {t('contribute.introRoadmapLink')}
            </ExternalLink>
            {t('contribute.introSuffix')}
          </p>
        </Card.Body>
      </Card>

      <section aria-labelledby="contribute-ways-heading">
        <h2 id="contribute-ways-heading" className="h4 mb-3">
          {t('contribute.waysHeading')}
        </h2>
        <Row className="g-4">
          {contributeWayIds.map((wayId) => (
            <Col key={wayId} md={6} lg={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <h3 className="h5">{t(`contribute.ways.${wayId}.heading`)}</h3>
                  <p className="text-body-secondary flex-grow-1">{t(`contribute.ways.${wayId}.body`)}</p>
                  <ul className="mb-0">
                    {contributeWayLinks[wayId].map((link) => (
                      <ContributeWayLinkItem
                        key={link.labelKey}
                        link={link}
                        localizedSitePath={localizedSitePath}
                      />
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section aria-labelledby="contribute-built-in-the-open-heading">
        <h2 id="contribute-built-in-the-open-heading" className="h4 mb-3">
          {t('contribute.builtInTheOpenHeading')}
        </h2>
        <p className="text-body-secondary">
          {t('contribute.builtInTheOpenBodyPrefix')}{' '}
          <NavLink to={localizedSitePath(siteRoutes.repositories)}>
            {t('contribute.builtInTheOpenRepositoriesLink')}
          </NavLink>{' '}
          {t('contribute.builtInTheOpenBodySuffix')}
        </p>
        <RepositoryCardGrid entries={entries} />
      </section>

      <Card>
        <Card.Body>
          <h2 className="h4">{t('contribute.relatedHeading')}</h2>
          <p className="text-body-secondary mb-0">
            {t('contribute.relatedPrefix')}{' '}
            <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('contribute.relatedHelpUsLink')}</NavLink>
            {t('contribute.relatedAfterHelpUs')}{' '}
            <NavLink to={localizedSitePath(siteRoutes.community)}>{t('contribute.relatedCommunityLink')}</NavLink>
            {t('contribute.relatedAfterCommunity')}{' '}
            <NavLink to={localizedSitePath(siteRoutes.about)}>{t('contribute.relatedAboutLink')}</NavLink>
            {t('contribute.relatedAfterAbout')}{' '}
            <NavLink to={localizedSitePath(siteRoutes.docs)}>{t('contribute.relatedDocsLink')}</NavLink>.
          </p>
        </Card.Body>
      </Card>
    </SitePageLayout>
  )
}

export default ContributePage
