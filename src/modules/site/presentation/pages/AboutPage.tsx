import { Col, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import ExternalLinkListItem from '../layout/ExternalLinkListItem'
import SitePageLayout from '../layout/SitePageLayout'
import SiteTextCard from '../layout/SiteTextCard'
import LocalizedCreatorProfileCard from '../people/LocalizedCreatorProfileCard'
import { siteRoutes } from '../routes/siteRoutes'

const WEBAPP_REPO_URL = 'https://github.com/agents-repo/webapp'
const REGISTRY_REPO_URL = 'https://github.com/agents-repo/registry'

function AboutPage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const whatYouCanDoItems = t('about.whatYouCanDoItems', { returnObjects: true }) as string[]

  return (
    <SitePageLayout title={t('about.title')}>
      <SiteTextCard heading={t('about.missionHeading')} body={t('about.missionBody')} />

      <Row className="g-4">
        <Col lg={6}>
          <SiteTextCard
            className="h-100"
            heading={t('about.whatYouCanDoHeading')}
            body={
              <ul className="text-body-secondary mb-0">
                {whatYouCanDoItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            }
          />
        </Col>

        <Col lg={6}>
          <SiteTextCard
            className="h-100"
            heading={t('about.howItWorksHeading')}
            body={t('about.howItWorksBody')}
          />
        </Col>
      </Row>

      <LocalizedCreatorProfileCard pageKey="about" />

      <SiteTextCard
        heading={t('about.getInvolvedHeading')}
        body={
          <>
            <p className="text-body-secondary">
              {t('about.getInvolvedIntro')}{' '}
              <NavLink to={localizedSitePath(siteRoutes.contact)}>{t('about.contactLink')}</NavLink>,{' '}
              {t('about.getInvolvedMiddle')}{' '}
              <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('about.helpUsLink')}</NavLink>
              {t('about.getInvolvedAfterHelpUs')}{' '}
              <NavLink to={localizedSitePath(siteRoutes.repositories)}>{t('about.repositoriesLink')}</NavLink>
              {t('about.getInvolvedSuffix')}
            </p>
            <ul className="mb-0">
              <ExternalLinkListItem
                href={WEBAPP_REPO_URL}
                accessibleLabel="agents-repo/webapp repository"
                suffix={t('about.webappRepoDescription')}
              >
                agents-repo/webapp
              </ExternalLinkListItem>
              <ExternalLinkListItem
                href={REGISTRY_REPO_URL}
                accessibleLabel="agents-repo/registry repository"
                suffix={t('about.registryRepoDescription')}
              >
                agents-repo/registry
              </ExternalLinkListItem>
            </ul>
          </>
        }
      />
    </SitePageLayout>
  )
}

export default AboutPage
