import { Col, Row } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { socialLinks } from '../../application/community/socialLinks'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import SitePageLayout from '../layout/SitePageLayout'
import SiteTextCard from '../layout/SiteTextCard'
import SocialExternalLink from '../layout/SocialExternalLink'
import LocalizedCreatorProfileCard from '../people/LocalizedCreatorProfileCard'
import { siteRoutes } from '../routes/siteRoutes'
import RepositoryContactCard from './RepositoryContactCard'

const WEBAPP_DISCUSSIONS_URL = 'https://github.com/agents-repo/webapp/discussions'
const WEBAPP_ISSUES_URL = 'https://github.com/agents-repo/webapp/issues'
const REGISTRY_DISCUSSIONS_URL = 'https://github.com/agents-repo/registry/discussions'
const REGISTRY_ISSUES_URL = 'https://github.com/agents-repo/registry/issues'

function ContactPage() {
  const { t } = useTranslation('pages')
  const { t: tShell } = useTranslation('shell')
  const localizedSitePath = useLocalizedSitePath()
  const beforeYouWriteItems = t('contact.beforeYouWriteItems', { returnObjects: true }) as string[]

  const webappContactLinks = [
    {
      href: WEBAPP_DISCUSSIONS_URL,
      accessibleLabel: t('contact.webappDiscussionsAriaLabel'),
      label: t('contact.discussions'),
      suffix: t('contact.webappDiscussionsSuffix'),
    },
    {
      href: WEBAPP_ISSUES_URL,
      accessibleLabel: t('contact.webappIssuesAriaLabel'),
      label: t('contact.issues'),
      suffix: t('contact.webappIssuesSuffix'),
    },
  ]

  const registryContactLinks = [
    {
      href: REGISTRY_DISCUSSIONS_URL,
      accessibleLabel: t('contact.registryDiscussionsAriaLabel'),
      label: t('contact.discussions'),
      suffix: t('contact.registryDiscussionsSuffix'),
    },
    {
      href: REGISTRY_ISSUES_URL,
      accessibleLabel: t('contact.registryIssuesAriaLabel'),
      label: t('contact.issues'),
      suffix: t('contact.registryIssuesSuffix'),
    },
  ]

  return (
    <SitePageLayout title={t('contact.title')}>
      <SiteTextCard heading={t('contact.reachOutHeading')} body={t('contact.reachOutBody')} />

      <Row className="g-4">
        <Col lg={6}>
          <RepositoryContactCard
            heading={t('contact.webappHeading')}
            body={t('contact.webappBody')}
            links={webappContactLinks}
          />
        </Col>

        <Col lg={6}>
          <RepositoryContactCard
            heading={t('contact.registryHeading')}
            body={t('contact.registryBody')}
            links={registryContactLinks}
          />
        </Col>
      </Row>

      <SiteTextCard
        heading={t('contact.communityHeading')}
        body={
          <>
            <p className="text-body-secondary">{t('contact.communityBody')}</p>
            <ul className="mb-0">
              {socialLinks.map((entry) => (
                <li key={entry.id}>
                  <SocialExternalLink entry={entry} /> — {tShell(`social.${entry.id}.shortDescription`)}
                </li>
              ))}
            </ul>
          </>
        }
      />

      <LocalizedCreatorProfileCard pageKey="contact" />

      <SiteTextCard
        heading={t('contact.beforeYouWriteHeading')}
        body={
          <>
            <p className="text-body-secondary">{t('contact.beforeYouWriteIntro')}</p>
            <ul className="text-body-secondary mb-0">
              {beforeYouWriteItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        }
      />

      <SiteTextCard
        heading={t('contact.relatedHeading')}
        body={
          <p className="text-body-secondary mb-0">
            {t('contact.relatedPrefix')}{' '}
            <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('contact.helpUsLink')}</NavLink>{' '}
            {t('contact.relatedMiddle')}{' '}
            <NavLink to={localizedSitePath(siteRoutes.about)}>{t('contact.aboutLink')}</NavLink>
            {t('contact.relatedSuffix')}
          </p>
        }
      />
    </SitePageLayout>
  )
}

export default ContactPage
