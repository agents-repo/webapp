import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getDocDetailPath } from '../../../../site/application/docs/docsCatalog'
import { publicSitePath, siteRoutes } from '../../../../site/presentation/routes/siteRoutes'

function HomeContributeSection() {
  return (
    <section className="py-4 py-lg-5 border-top border-secondary-subtle">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <h2 className="h3 mb-3">Help grow the catalog</h2>
            <p className="text-body-secondary mb-4">
              The project needs agents and flows packages most. Submit a maintained package, or see
              other ways to help.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Link
                to={publicSitePath(getDocDetailPath('submitting-a-package'))}
                className="btn btn-primary"
              >
                Submit a package
              </Link>
              <Link to={publicSitePath(siteRoutes.helpUs)} className="btn btn-outline-primary">
                Help Us
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HomeContributeSection
