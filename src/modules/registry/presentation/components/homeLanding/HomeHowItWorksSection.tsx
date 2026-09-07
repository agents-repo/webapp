import { Col, Container, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

function HomeHowItWorksSection() {
  const { t } = useTranslation('catalog')
  const steps = [
    {
      title: t('homeLanding.howItWorks.step1Title'),
      body: t('homeLanding.howItWorks.step1Body'),
    },
    {
      title: t('homeLanding.howItWorks.step2Title'),
      body: t('homeLanding.howItWorks.step2Body'),
    },
    {
      title: t('homeLanding.howItWorks.step3Title'),
      body: t('homeLanding.howItWorks.step3Body'),
    },
  ] as const

  return (
    <section className="py-4 py-lg-5 bg-body-tertiary">
      <Container>
        <h2 className="h3 text-center mb-4">{t('homeLanding.howItWorks.heading')}</h2>
        <Row as="ol" className="g-4 list-unstyled mb-0">
          {steps.map((step, index) => (
            <Col key={step.title} as="li" md={4}>
              <p className="display-6 text-primary fw-semibold mb-2" aria-hidden="true">
                {index + 1}
              </p>
              <h3 className="h5">{step.title}</h3>
              <p className="text-body-secondary mb-0">{step.body}</p>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default HomeHowItWorksSection
