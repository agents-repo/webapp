import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { listContributors, listMaintainers } from '../../application/people/peopleManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'
import PersonCard from '../people/PersonCard.tsx'

function PersonCardGrid({
  people,
}: {
  readonly people: ReturnType<typeof listMaintainers>
}) {
  return (
    <Row className="g-4 justify-content-center">
      {people.map((person) => (
        <Col key={person.githubLogin} xs={12} sm={6} lg={4}>
          <PersonCard person={person} />
        </Col>
      ))}
    </Row>
  )
}

function CommunityPage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const maintainers = listMaintainers()
  const contributors = listContributors()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('community.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <p className="text-body-secondary mb-0">
                {t('community.introPrefix')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('community.helpUsLink')}</NavLink>
                {t('community.introSuffix')}
              </p>
            </Card.Body>
          </Card>

          <section aria-labelledby="community-maintainers-heading">
            <h2 id="community-maintainers-heading" className="h4 mb-3">
              {t('community.maintainersHeading')}
            </h2>
            <PersonCardGrid people={maintainers} />
          </section>

          <section aria-labelledby="community-contributors-heading">
            <h2 id="community-contributors-heading" className="h4 mb-3">
              {t('community.contributorsHeading')}
            </h2>
            {contributors.length === 0 ? (
              <Card>
                <Card.Body>
                  <p className="text-body-secondary mb-0 text-center">
                    {t('community.noContributorsPrefix')}{' '}
                    <span aria-hidden="true">😢</span>, {t('community.noContributorsSuffix')}{' '}
                    <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('community.helpUsLink')}</NavLink>.
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <PersonCardGrid people={contributors} />
            )}
          </section>
        </Stack>
      </Container>
    </div>
  )
}

export default CommunityPage
