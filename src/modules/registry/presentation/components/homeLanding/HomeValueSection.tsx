import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faMagnifyingGlass, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { Card, Col, Container, Row } from 'react-bootstrap'

const valueCards = [
  {
    icon: faMagnifyingGlass,
    title: 'Discover curated packages',
    body: 'Search agents and flows by name, owner, tags, and tool. Status badges show what is maintained.',
  },
  {
    icon: faTerminal,
    title: 'Install into your editor',
    body: 'The CLI places packages into GitHub Copilot, Cursor, Claude Code, or OpenAI Codex layouts.',
  },
  {
    icon: faComments,
    title: 'Try in chat first',
    body: 'Copy instruction URLs and prompts into ChatGPT, Grok, Gemini, or Microsoft Copilot when a package is chat-ready.',
  },
] as const

function HomeValueSection() {
  return (
    <section className="py-4 py-lg-5">
      <Container>
        <h2 className="h3 text-center mb-4">What you gain</h2>
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
