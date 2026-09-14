import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../../../../site/presentation/routes/siteRoutes'

function HomeContributeSection() {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()

  return (
    <section className="py-4 py-lg-5 border-top border-secondary-subtle">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <h2 className="h3 mb-3">{t('homeLanding.contribute.heading')}</h2>
            <p className="text-body-secondary mb-4">{t('homeLanding.contribute.body')}</p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Link to={localizedSitePath(siteRoutes.contribute)} className="btn btn-primary">
                {t('homeLanding.contribute.primaryButton')}
              </Link>
              <Link to={localizedSitePath(siteRoutes.contribute)} className="btn btn-outline-primary">
                {t('homeLanding.contribute.secondaryButton')}
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HomeContributeSection
