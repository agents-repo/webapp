import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'

function HomeUseInChatSection() {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const chatReadyPackagesPath = localizedSitePath(`${getPackagesIndexPath()}?chatWeb=1`)

  return (
    <section className="py-4 py-lg-5 bg-body-tertiary">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <h2 className="h3 mb-3">{t('homeLanding.useInChat.heading')}</h2>
            <p className="text-body-secondary mb-4">{t('homeLanding.useInChat.body')}</p>
            <Link to={chatReadyPackagesPath} className="btn btn-outline-primary">
              {t('homeLanding.useInChat.browseButton')}
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HomeUseInChatSection
