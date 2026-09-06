import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { socialLinks } from '../../application/community/socialLinks'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import SocialExternalLink from '../layout/SocialExternalLink'
import CreatorProfileCard from '../people/CreatorProfileCard'
import { siteRoutes } from '../routes/siteRoutes'

const WEBAPP_DISCUSSIONS_URL = 'https://github.com/agents-repo/webapp/discussions'
const WEBAPP_ISSUES_URL = 'https://github.com/agents-repo/webapp/issues'
const REGISTRY_DISCUSSIONS_URL = 'https://github.com/agents-repo/registry/discussions'
const REGISTRY_ISSUES_URL = 'https://github.com/agents-repo/registry/issues'

function ContactPage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const beforeYouWriteItems = t('contact.beforeYouWriteItems', { returnObjects: true }) as string[]

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('contact.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">{t('contact.reachOutHeading')}</h2>
              <p className="text-body-secondary mb-0">{t('contact.reachOutBody')}</p>
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">{t('contact.webappHeading')}</h2>
                  <p className="text-body-secondary">{t('contact.webappBody')}</p>
                  <ul className="mb-0">
                    <li>
                      <a
                        href={WEBAPP_DISCUSSIONS_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Webapp discussions')}
                      >
                        {t('contact.discussions')}
                      </a>{' '}
                      {t('contact.webappDiscussionsSuffix')}
                    </li>
                    <li>
                      <a
                        href={WEBAPP_ISSUES_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Webapp issues')}
                      >
                        {t('contact.issues')}
                      </a>{' '}
                      {t('contact.webappIssuesSuffix')}
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">{t('contact.registryHeading')}</h2>
                  <p className="text-body-secondary">{t('contact.registryBody')}</p>
                  <ul className="mb-0">
                    <li>
                      <a
                        href={REGISTRY_DISCUSSIONS_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Registry discussions')}
                      >
                        {t('contact.discussions')}
                      </a>{' '}
                      {t('contact.registryDiscussionsSuffix')}
                    </li>
                    <li>
                      <a
                        href={REGISTRY_ISSUES_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={externalLinkAccessibleName('Registry issues')}
                      >
                        {t('contact.issues')}
                      </a>{' '}
                      {t('contact.registryIssuesSuffix')}
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('contact.communityHeading')}</h2>
              <p className="text-body-secondary">{t('contact.communityBody')}</p>
              <ul className="mb-0">
                {socialLinks.map((entry) => (
                  <li key={entry.id}>
                    <SocialExternalLink entry={entry} /> — {entry.shortDescription}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <CreatorProfileCard
            heading={t('contact.creatorHeading')}
            bodyPrefix={t('contact.creatorBodyPrefix')}
            collaboratorsLink={t('contact.collaboratorsLink')}
            bodySuffix={t('contact.creatorBodySuffix')}
            communityPath={localizedSitePath(siteRoutes.community)}
            githubAriaLabel={t('contact.creatorGithubAriaLabel')}
            linkedinAriaLabel={t('contact.creatorLinkedinAriaLabel')}
            githubLabel={t('contact.github')}
            linkedinLabel={t('contact.linkedin')}
          />

          <Card>
            <Card.Body>
              <h2 className="h4">{t('contact.beforeYouWriteHeading')}</h2>
              <p className="text-body-secondary">{t('contact.beforeYouWriteIntro')}</p>
              <ul className="text-body-secondary mb-0">
                {beforeYouWriteItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('contact.relatedHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('contact.relatedPrefix')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('contact.helpUsLink')}</NavLink>{' '}
                {t('contact.relatedMiddle')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.about)}>{t('contact.aboutLink')}</NavLink>
                {t('contact.relatedSuffix')}
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default ContactPage
