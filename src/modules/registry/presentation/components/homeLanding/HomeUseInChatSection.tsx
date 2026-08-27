import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { publicSitePath } from '../../../../site/presentation/routes/siteRoutes'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'

function HomeUseInChatSection() {
  const chatReadyPackagesPath = publicSitePath(`${getPackagesIndexPath()}?chatWeb=1`)

  return (
    <section className="py-4 py-lg-5 bg-body-tertiary">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <h2 className="h3 mb-3">Use in chat without installing</h2>
            <p className="text-body-secondary mb-4">
              Some packages are chat-ready. Copy an instruction URL or markdown and a starter prompt
              into ChatGPT, Grok, Gemini, or Microsoft Copilot in the browser—no project install
              required.
            </p>
            <Link to={chatReadyPackagesPath} className="btn btn-outline-primary">
              Browse chat-ready packages
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HomeUseInChatSection
