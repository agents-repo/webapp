import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { listContributors, listMaintainers } from '../../application/people/peopleManifest.ts'
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
  const maintainers = listMaintainers()
  const contributors = listContributors()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">Community</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <p className="text-body-secondary mb-0">
                These are the people who maintain the Agents Repo platform repositories. Contributors
                who help through pull requests will appear here as well. If you want to join in, start
                on <NavLink to={siteRoutes.helpUs}>Help Us</NavLink>.
              </p>
            </Card.Body>
          </Card>

          <section aria-labelledby="community-maintainers-heading">
            <h2 id="community-maintainers-heading" className="h4 mb-3">
              Maintainers
            </h2>
            <PersonCardGrid people={maintainers} />
          </section>

          <section aria-labelledby="community-contributors-heading">
            <h2 id="community-contributors-heading" className="h4 mb-3">
              Contributors
            </h2>
            {contributors.length === 0 ? (
              <Card>
                <Card.Body>
                  <p className="text-body-secondary mb-0 text-center">
                    We don't have any contributor yet{' '}
                    <span aria-hidden="true">😢</span>, find how to help us at{' '}
                    <NavLink to={siteRoutes.helpUs}>Help Us</NavLink>.
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
