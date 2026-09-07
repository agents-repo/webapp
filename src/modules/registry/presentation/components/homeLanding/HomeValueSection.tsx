import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faMagnifyingGlass, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

function HomeValueSection() {
  const { t } = useTranslation('catalog')
  const valueCards = [
    {
      icon: faMagnifyingGlass,
      title: t('homeLanding.value.discoverTitle'),
      body: t('homeLanding.value.discoverBody'),
    },
    {
      icon: faTerminal,
      title: t('homeLanding.value.installTitle'),
      body: t('homeLanding.value.installBody'),
    },
    {
      icon: faComments,
      title: t('homeLanding.value.chatTitle'),
      body: t('homeLanding.value.chatBody'),
    },
  ] as const

  return (
    <section className="py-4 py-lg-5">
      <Container>
        <h2 className="h3 text-center mb-4">{t('homeLanding.value.heading')}</h2>
        <Row className="g-4">
          {valueCards.map((card) => (
            <Col key={card.title} md={4}>
              <Card className="h-100 border-secondary-subtle">
                <Card.Body>
                  <FontAwesomeIcon
                    icon={card.icon}
                    className="text-primary mb-3"
                    size="lg"
                    aria-hidden="true"
                  />
                  <h3 className="h5">{card.title}</h3>
                  <p className="text-body-secondary mb-0">{card.body}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default HomeValueSection
