import { useState } from 'react'
import { Badge, Button, Card, Col, Container, Row, Stack } from 'react-bootstrap'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app-shell py-4 py-lg-5">
      <Container>
        <Row className="g-4 justify-content-center align-items-stretch">
          <Col lg={7}>
            <Card className="hero-card h-100 border-0 shadow-sm">
              <Card.Body className="p-4 p-lg-5">
                <Stack direction="horizontal" gap={2} className="mb-3">
                  <Badge bg="primary">Vite + React</Badge>
                  <Badge bg="success">React Bootstrap</Badge>
                </Stack>

                <div className="hero mb-4" aria-hidden="true">
                  <img
                    src={heroImg}
                    className="base"
                    width="170"
                    height="179"
                    alt=""
                  />
                  <img src={reactLogo} className="framework" alt="React logo" />
                  <img src={viteLogo} className="vite" alt="Vite logo" />
                </div>

                <h1 className="display-5 fw-bold mb-3">Bootstrap setup complete</h1>
                <p className="lead mb-4">
                  Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
                  .
                </p>

                <Button
                  type="button"
                  size="lg"
                  onClick={() => setCount((value) => value + 1)}
                >
                  Count is {count}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4 p-lg-5">
                <h2 className="h4 mb-3">Next steps</h2>
                <p className="mb-4 text-secondary">
                  Start building with React Bootstrap components and utility
                  classes.
                </p>

                <Stack gap={2}>
                  <Button
                    as="a"
                    href="https://react-bootstrap.github.io/"
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-primary"
                  >
                    React Bootstrap docs
                  </Button>
                  <Button
                    as="a"
                    href="https://vite.dev/"
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-secondary"
                  >
                    Vite docs
                  </Button>
                  <Button
                    as="a"
                    href="https://react.dev/"
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-secondary"
                  >
                    React docs
                  </Button>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default App
