import { Col, Container, Row } from 'react-bootstrap'

const steps = [
  {
    title: 'Browse or search the catalog',
    body: 'Find an agent or flow on Home or Packages, then open the package page for details.',
  },
  {
    title: 'Install or copy chat instructions',
    body: 'Run two CLI commands in your project, or copy chat-ready instructions into a browser chat.',
  },
  {
    title: 'Use it in your coding tool',
    body: 'The agent or flow is ready in GitHub Copilot, Cursor, Claude Code, or OpenAI Codex.',
  },
] as const

function HomeHowItWorksSection() {
  return (
    <section className="py-4 py-lg-5 bg-body-tertiary">
      <Container>
        <h2 className="h3 text-center mb-4">How it works</h2>
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
