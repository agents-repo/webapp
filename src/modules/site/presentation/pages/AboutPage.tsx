import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import CreatorProfileCard from '../people/CreatorProfileCard'
import { siteRoutes } from '../routes/siteRoutes'

const WEBAPP_REPO_URL = 'https://github.com/agents-repo/webapp'
const REGISTRY_REPO_URL = 'https://github.com/agents-repo/registry'

function AboutPage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const whatYouCanDoItems = t('about.whatYouCanDoItems', { returnObjects: true }) as string[]

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('about.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">{t('about.missionHeading')}</h2>
              <p className="text-body-secondary mb-0">{t('about.missionBody')}</p>
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">{t('about.whatYouCanDoHeading')}</h2>
                  <ul className="text-body-secondary mb-0">
                    {whatYouCanDoItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="h4">{t('about.howItWorksHeading')}</h2>
                  <p className="text-body-secondary mb-0">{t('about.howItWorksBody')}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <CreatorProfileCard
            heading={t('about.creatorHeading')}
            bodyPrefix={t('about.creatorBodyPrefix')}
            collaboratorsLink={t('about.collaboratorsLink')}
            bodySuffix={t('about.creatorBodySuffix')}
            communityPath={localizedSitePath(siteRoutes.community)}
            githubAriaLabel={t('about.creatorGithubAriaLabel')}
            linkedinAriaLabel={t('about.creatorLinkedinAriaLabel')}
            githubLabel={t('about.github')}
            linkedinLabel={t('about.linkedin')}
          />

          <Card>
            <Card.Body>
              <h2 className="h4">{t('about.getInvolvedHeading')}</h2>
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
                <li>
                  <a
                    href={WEBAPP_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('agents-repo/webapp repository')}
                  >
                    agents-repo/webapp
                  </a>{' '}
                  {t('about.webappRepoDescription')}
                </li>
                <li>
                  <a
                    href={REGISTRY_REPO_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={externalLinkAccessibleName('agents-repo/registry repository')}
                  >
                    agents-repo/registry
                  </a>{' '}
                  {t('about.registryRepoDescription')}
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default AboutPage
